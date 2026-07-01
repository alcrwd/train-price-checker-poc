const fs = require("fs");
const path = require("path");

const DEBUG_DEPARTURE_TIME_PASSED_PATH = path.join(
  __dirname,
  "..",
  "..",
  "artifacts",
  "debug-departure-time-passed.json"
);

const DEBUG_UNAVAILABLE_PATH = path.join(
  __dirname,
  "..",
  "..",
  "artifacts",
  "debug-future-unavailable.json"
);

let hasWrittenDepartureTimePassedDebug = false;
let hasWrittenUnavailableDebug = false;

function writeDebugFile(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(
    filePath,
    JSON.stringify(payload, null, 2),
    "utf8"
  );
}

function getMissingPriceReason(offersJson) {
  if (!offersJson) {
    return {
      reason: "no-offer-json-for-departure",
      debugFile: null,
    };
  }

  const departureStatus = offersJson.departureStatus || [];

  if (departureStatus.includes("DEPARTURE_TIME_PASSED")) {
    return {
      reason: "departure-time-passed",
      debugFile: DEBUG_DEPARTURE_TIME_PASSED_PATH,
    };
  }

  return {
    reason: "future-unavailable",
    debugFile: DEBUG_UNAVAILABLE_PATH,
  };
}

function writeMissingPriceDebug({ trip, offersJson, reasonInfo }) {
  if (!offersJson) return;

  if (reasonInfo.reason === "departure-time-passed") {
    if (hasWrittenDepartureTimePassedDebug) return;

    writeDebugFile(reasonInfo.debugFile, {
      reason: reasonInfo.reason,
      trip,
      offersJson,
    });

    console.log("Saved debug response: departure-time-passed");

    hasWrittenDepartureTimePassedDebug = true;
    return;
  }

  if (reasonInfo.reason === "future-unavailable") {
    if (hasWrittenUnavailableDebug) return;

    writeDebugFile(reasonInfo.debugFile, {
      reason: reasonInfo.reason,
      trip,
      offersJson,
    });

    console.log("Saved debug response: future-unavailable");

    hasWrittenUnavailableDebug = true;
  }
}

function extractCheapestAvailablePrice(offersJson) {
  const prices = [];

  const seatOffers = offersJson.seatOffers?.offers || {};

  for (const comfort of Object.values(seatOffers)) {
    const flexibilities = comfort.flexibilities || {};

    for (const flexibility of Object.values(flexibilities)) {
      if (!flexibility.available) continue;

      const amount = flexibility.journeyPrices?.price?.amount;
      if (!amount) continue;

      prices.push(parseInt(amount, 10));
    }
  }

  if (prices.length === 0) return null;

  return Math.min(...prices);
}

function attachOffersToTrips(trips, offersByDepartureId) {
  return trips.map((trip) => {
    const offersJson = offersByDepartureId[trip.id];
    const price = offersJson ? extractCheapestAvailablePrice(offersJson) : null;

    if (price === null) {
      const reasonInfo = getMissingPriceReason(offersJson);

      writeMissingPriceDebug({
        trip,
        offersJson,
        reasonInfo,
      });
    }

    return {
      ...trip,
      price,
      hasPrice: price !== null,
    };
  });
}

module.exports = {
  extractCheapestAvailablePrice,
  attachOffersToTrips,
};
