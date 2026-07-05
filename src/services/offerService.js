let hasLoggedBedOfferDebug = false;

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

function extractAmount(journeyPrices) {
  const amount = journeyPrices?.price?.amount;
  if (!amount) return null;

  const parsed = parseInt(amount, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function summarizeSeatOffers(offersJson) {
  const seatOffers = offersJson?.seatOffers?.offers || {};
  const rows = [];

  for (const [comfortKey, comfort] of Object.entries(seatOffers)) {
    const flexibilities = comfort.flexibilities || {};

    for (const [flexKey, flexibility] of Object.entries(flexibilities)) {
      rows.push({
        comfort: comfortKey,
        flex: flexKey,
        available: Boolean(flexibility.available),
        price: extractAmount(flexibility.journeyPrices),
      });
    }
  }

  return rows;
}

function summarizeBedOffers(offersJson) {
  const bedOffers = offersJson?.bedOffers?.offers || {};
  const rows = [];

  for (const [bedTypeKey, bedType] of Object.entries(bedOffers)) {
    const comfortTypes = bedType.comfortTypes || {};

    for (const [comfortKey, comfort] of Object.entries(comfortTypes)) {
      const flexibilities = comfort.flexibilities || {};

      for (const [flexKey, flexibility] of Object.entries(flexibilities)) {
        rows.push({
          bedType: bedTypeKey,
          comfort: comfortKey,
          flex: flexKey,
          available: Boolean(flexibility.available),
          price: extractAmount(flexibility.journeyPrices),
        });
      }
    }
  }

  return rows;
}

function writeMissingPriceDebug({ trip, offersJson }) {
  if (!offersJson?.bedOffers) return;
  if (hasLoggedBedOfferDebug) return;

  hasLoggedBedOfferDebug = true;

  console.log("\n================ BED OFFER DEBUG ================\n");

  console.log(
    JSON.stringify(
      {
        trip: {
          id: trip.id,
          departureTime: trip.departureTime,
          arrivalTime: trip.arrivalTime,
          trainNumber: trip.trainNumber,
          operatorName: trip.operatorName,
          departureStatus: trip.departureStatus,
        },
        departureStatus: getDepartureStatuses(offersJson),
        seatOffers: summarizeSeatOffers(offersJson),
        bedOffers: summarizeBedOffers(offersJson),
      },
      null,
      2
    )
  );

  console.log("\n=================================================\n");
}

function extractCheapestAvailablePrice(offersJson) {
  const prices = [];

  const seatOffers = offersJson?.seatOffers?.offers || {};

  for (const comfort of Object.values(seatOffers)) {
    const flexibilities = comfort.flexibilities || {};

    for (const flexibility of Object.values(flexibilities)) {
      if (!flexibility.available) continue;

      const amount = extractAmount(flexibility.journeyPrices);
      if (!amount) continue;

      prices.push(amount);
    }
  }

  if (prices.length === 0) return null;

  return Math.min(...prices);
}

function attachOffersToTrips(trips, offersByDepartureId) {
  return trips.map((trip) => {
    const offersJson = offersByDepartureId[trip.id];
    const price = offersJson ? extractCheapestAvailablePrice(offersJson) : null;

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
