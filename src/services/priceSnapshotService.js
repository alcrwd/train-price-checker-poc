function createPriceSnapshot({ fromStation, toStation, date, trips }) {
  return {
    route: {
      from: fromStation,
      to: toStation,
    },
    date,
    scannedAt: new Date().toISOString(),
    numberOfTrips: trips.length,
    numberOfPricedTrips: trips.filter((trip) => trip.hasPrice).length,
    lowestPrice: getLowestPrice(trips),
    trips: trips.map(normalizeTripForSnapshot),
  };
}

function getLowestPrice(trips) {
  const prices = trips
    .map((trip) => trip.price)
    .filter((price) => typeof price === "number");

  if (prices.length === 0) return null;

  return Math.min(...prices);
}

function normalizeTripForSnapshot(trip) {
  return {
    id: trip.id,
    departure: trip.departure,
    arrival: trip.arrival,
    durationMinutes: trip.durationMinutes,
    numberOfChanges: trip.numberOfChanges,
    routeType: trip.routeType,
    operators: (trip.legs || []).map((leg) => ({
      operator: leg.operator,
      trainNumber: leg.trainNumber,
      from: leg.from,
      to: leg.to,
      departure: leg.departure,
      arrival: leg.arrival,
    })),
    price: trip.price,
    hasPrice: trip.hasPrice,
  };
}

module.exports = {
  createPriceSnapshot,
  getLowestPrice,
};
