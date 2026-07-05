const { getTripsWithPrices } = require("./journeyService");

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isTimeBefore(a, b) {
  return timeToMinutes(a) < timeToMinutes(b);
}

function calculateTotalTransferMinutes(legs) {
  if (!legs || legs.length < 2) return 0;

  let total = 0;

  for (let i = 0; i < legs.length - 1; i++) {
    const arrival = new Date(
      `${legs[i].arrivalDate}T${legs[i].arrivalTime}:00`
    );
    const departure = new Date(
      `${legs[i + 1].departureDate}T${legs[i + 1].departureTime}:00`
    );

    total += Math.round((departure - arrival) / 60000);
  }

  return total;
}

function mapTripLegsToJourneyLegs(trip, travelDate) {
  let currentDepartureDate = travelDate;
  let previousArrivalDate = null;
  let previousArrivalTime = null;

  return (trip.legs || []).map((leg) => {
    let departureDate = currentDepartureDate;

    if (
      previousArrivalDate &&
      previousArrivalTime &&
      isTimeBefore(leg.departure, previousArrivalTime)
    ) {
      departureDate = addDays(previousArrivalDate, 1);
    } else if (previousArrivalDate) {
      departureDate = previousArrivalDate;
    }

    const arrivalDate = isTimeBefore(leg.arrival, leg.departure)
      ? addDays(departureDate, 1)
      : departureDate;

    previousArrivalDate = arrivalDate;
    previousArrivalTime = leg.arrival;
    currentDepartureDate = departureDate;

    return {
      origin: leg.from,
      destination: leg.to,
      departureDate,
      departureTime: leg.departure,
      arrivalDate,
      arrivalTime: leg.arrival,
      operator: leg.operator,
      trainNumber: leg.trainNumber,
    };
  });
}

function mapTripToJourney(trip, search) {
  const legs = mapTripLegsToJourneyLegs(trip, search.travelDate);
  const lastLeg = legs[legs.length - 1];

  return {
    id: trip.id,
    travelDate: search.travelDate,

    price: trip.price,
    currency: "SEK",
    departureStatus: trip.departureStatus,

    departureTime: trip.departure,
    arrivalDate:
      lastLeg?.arrivalDate ||
      (isTimeBefore(trip.arrival, trip.departure)
        ? addDays(search.travelDate, 1)
        : search.travelDate),
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
