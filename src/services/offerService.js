const fs = require("fs");
const path = require("path");

const DEBUG_DIRECTORY = path.join(__dirname, "..", "..", "artifacts");

const writtenDebugStatuses = new Set();

function normalizeStatusForFilename(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getDepartureStatuses(offersJson) {
  const statuses = offersJson?.departureStatus;

  if (Array.isArray(statuses) && statuses.length > 0) {
    return statuses;
  }

  return ["UNKNOWN_STATUS"];
}

function getPrimaryDepartureStatus({ price, offersJson }) {
  if (typeof price === "number") {
    return "PRICED";
  }

  return getDepartureStatuses(offersJson)[0];
}

function getDebugFilePath(departureStatuses) {
  const statusKey = departureStatuses
    .map(normalizeStatusForFilename)
    .join("__");

  return path.join(DEBUG_DIRECTORY, `debug-missing-price-${statusKey}.json`);
}

function writeDebugFile(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function writeMissingPriceDebug({ trip, offersJson }) {
  const departureStatuses = getDepartureStatuses(offersJson);
  const statusKey = departureStatuses.join("|");

  if (writtenDebugStatuses.has(statusKey)) {
    return;
  }

  const filePath = getDebugFilePath(departureStatuses);

  writeDebugFile(filePath, {
    reason: "departure-status",
    departureStatus: departureStatuses,
    trip,
    offersJson: offersJson || null,
  });

  console.log(`Saved debug response: ${statusKey}`);

  writtenDebugStatuses.add(statusKey);
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
    const departureStatus = getPrimaryDepartureStatus({ price, offersJson });

    if (price === null) {
      writeMissingPriceDebug({
        trip,
        offersJson,
      });
    }

    return {
      ...trip,
      price,
      hasPrice: price !== null,
      departureStatus,
    };
  });
}

module.exports = {
  extractCheapestAvailablePrice,
  attachOffersToTrips,
};
