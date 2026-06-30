const { getTripsWithPrices } = require("./journeyService");

function mapTripToJourney(trip, search) {
  return {
    id: trip.id,
    travelDate: search.travelDate,

    price: trip.price,
    currency: "SEK",

    departureTime: trip.departure,
    arrivalTime: trip.arrival,
    durationMinutes: trip.durationMinutes,

    numberOfChanges: trip.numberOfChanges,

    legs: (trip.legs || []).map((leg) => ({
      origin: leg.from,
      destination: leg.to,
      departureTime: leg.departure,
      arrivalTime: leg.arrival,
      operator: leg.operator,
      trainNumber: leg.trainNumber,
    })),
  };
}

async function createDataset(search) {
  const trips = await getTripsWithPrices({
    fromStation: search.origin,
    toStation: search.destination,
    date: search.travelDate,
  });

  const journeys = trips.map((trip) => mapTripToJourney(trip, search));

  return {
    generatedAt: new Date().toISOString(),
    search,
    journeys,
  };
}

module.exports = {
  createDataset,
};
