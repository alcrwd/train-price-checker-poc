const { getTripsWithPrices } = require("./journeyService");

function calculateTotalTransferMinutes(legs) {
  if (!legs || legs.length < 2) {
    return 0;
  }

  let total = 0;

  for (let i = 0; i < legs.length - 1; i++) {
    const arrival = new Date(`1970-01-01T${legs[i].arrivalTime}:00`);
    const departure = new Date(`1970-01-01T${legs[i + 1].departureTime}:00`);

    total += Math.round((departure - arrival) / 60000);
  }

  return total;
}

function mapTripToJourney(trip, search) {
  const legs = (trip.legs || []).map((leg) => ({
    origin: leg.from,
    destination: leg.to,
    departureTime: leg.departure,
    arrivalTime: leg.arrival,
    operator: leg.operator,
    trainNumber: leg.trainNumber,
  }));

  return {
    id: trip.id,

    travelDate: search.travelDate,

    price: trip.price,
    currency: "SEK",

    departureTime: trip.departure,
    arrivalTime: trip.arrival,

    durationMinutes: trip.durationMinutes,

    numberOfChanges: trip.numberOfChanges,

    totalTransferMinutes: calculateTotalTransferMinutes(legs),

    legs,
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
