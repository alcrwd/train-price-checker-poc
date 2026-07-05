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
    offerKeys: offersJson.offers
      ? Object.keys(offersJson.offers)
      : [],
  };
}

function writeMissingPriceDebug({ trip, offersJson }) {
  console.log("\n================ MISSING PRICE DEBUG ================\n");

  console.log(
    JSON.stringify(
      {
        trip: {
          id: trip.id,
          departureTime: trip.departureTime,
          arrivalTime: trip.arrivalTime,
          trainNumber: trip.trainNumber,
          operatorName: trip.operatorName,
        },
        offerSummary: summarizeOfferBranches(offersJson),
        offersJson,
      },
      null,
      2
    )
  );

  console.log("\n=====================================================\n");
}

function extractCheapestAvailablePrice(offersJson) {
  const prices = [];

  const seatOffers = offersJson?.seatOffers?.offers || {};

  for (const comfort of Object.values(seatOffers)) {
    const flexibilities = comfort.flexibilities || {};

    for (const flexibility of Object.values(flexibilities)) {
      if (!flexibility.available) continue;

      const amount = flexibility.journeyPrices?.price?.amount;

      if (!amount) continue;

      prices.push(parseInt(amount, 10));
    }
  }

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

function attachOffersToTrips(trips, offersByDepartureId) {
  return trips.map((trip) => {
    const offersJson = offersByDepartureId[trip.id];

    const price = offersJson
      ? extractCheapestAvailablePrice(offersJson)
      : null;

    const departureStatus = getPrimaryDepartureStatus({
      price,
      offersJson,
    });

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
