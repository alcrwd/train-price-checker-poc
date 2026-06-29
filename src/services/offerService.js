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
