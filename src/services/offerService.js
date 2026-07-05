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

function summarizeOfferBranches(offersJson) {
  if (!offersJson) return null;

  return {
    topLevelKeys: Object.keys(offersJson),

    departureStatus: offersJson.departureStatus || null,

    hasSeatOffers: Boolean(offersJson.seatOffers),
    seatOfferKeys: offersJson.seatOffers
      ? Object.keys(offersJson.seatOffers)
      : [],

    hasAccommodationOffers: Boolean(offersJson.accommodationOffers),
    accommodationOfferKeys: offersJson.accommodationOffers
      ? Object.keys(offersJson.accommodationOffers)
      : [],

    hasOffers: Boolean(offersJson.offers),
    offerKeys: offersJson.offers ? Object.keys(offersJson.offers) : [],

    hasComfortOffers: Boolean(offersJson.comfortOffers),
    comfortOfferKeys: offersJson.comfortOffers
      ? Object.keys(offersJson.comfortOffers)
      : [],

    hasAvailableOffers: Boolean(offersJson.availableOffers),
    availableOfferKeys: offersJson.availableOffers
      ? Object.keys(offersJson.availableOffers)
      : [],
  };
}

function writeMissingPriceDebug({ trip, offersJson }) {
  const departureStatuses = getDepartureStatuses(offersJson);
  const statusKey = `${trip.trainNumber || "unknown"}|${trip.departureTime || "unknown"}|${departureStatuses.join("|")}`;

  if (writtenDebugStatuses.has(statusKey)) {
    return;
  }

  const filePath = getDebugFilePath([
    trip.trainNumber || "unknown-train",
    trip.departureTime || "unknown-time",
    ...departureStatuses,
  ]);

  writeDebugFile(filePath, {
    reason: "missing-seat-price",
    departureStatus: departureStatuses,
    trip,
    offerSummary: summarizeOfferBranches(offersJson),
    offersJson: offersJson || null,
  });

  console.log(
    `Saved missing-price debug: train=${trip.trainNumber || "unknown"} departure=${trip.departureTime || "unknown"} status=${departureStatuses.join("|")}`
  );

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
