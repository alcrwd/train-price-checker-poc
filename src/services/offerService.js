const fs = require("fs");
const path = require("path");

const DEBUG_MISSING_PRICE_PATH = path.join(
  __dirname,
  "..",
  "..",
  "artifacts",
  "debug-missing-price.json"
);

let hasWrittenMissingPriceDebug = false;

function writeMissingPriceDebug({ trip, offersJson, reason }) {
  if (hasWrittenMissingPriceDebug) return;
  if (!offersJson) return;

  fs.mkdirSync(path.dirname(DEBUG_MISSING_PRICE_PATH), { recursive: true });

  fs.writeFileSync(
    DEBUG_MISSING_PRICE_PATH,
    JSON.stringify(
      {
        reason,
        trip,
        offersJson,
      },
      null,
      2
    ),
    "utf8"
  );

  hasWrittenMissingPriceDebug = true;
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
      writeMissingPriceDebug({
        trip,
        offersJson,
        reason: offersJson
          ? "offer-found-but-no-available-price"
          : "no-offer-json-for-departure",
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
