function formatTime(dateTime) {
  if (!dateTime) return null;
  return dateTime.slice(11, 16);
}

function parseIsoDurationToMinutes(duration) {
  if (!duration) return null;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  return hours * 60 + minutes;
}

function mapLeg(leg) {
  if (!leg) return null;

  return {
    from: leg.origin?.name || null,
    to: leg.destination?.name || null,
    departure: formatTime(leg.departureDateTime),
    arrival: formatTime(leg.arrivalDateTime),
    duration: leg.duration || null,
    durationMinutes: parseIsoDurationToMinutes(leg.duration),
    trainNumber: leg.publicServiceName || leg.serviceName || null,
    operator: leg.serviceType?.name || null,
    operatorName: leg.serviceType?.operatorName || null,
    brand: leg.serviceBrandNameDescription || null,
    changeTime: leg.changeTime || null,
    changeMinutes: parseIsoDurationToMinutes(leg.changeTime),
  };
}

function classifyRoute(firstLeg, secondLeg) {
  if (
    firstLeg?.to === "Norrköping Central" &&
    secondLeg?.from === "Norrköping Central"
  ) {
    return "via-norrkoping";
  }

  if (
    firstLeg?.to === "Stockholm Central" ||
    secondLeg?.from === "Stockholm Central"
  ) {
    return "via-stockholm";
  }

  return "other";
}

function mapDepartureToTrip(departure) {
  const legs = departure.legs || [];
  const firstLeg = mapLeg(legs[0]);
  const secondLeg = mapLeg(legs[1]);

  return {
    id: departure.departureId,
    from: departure.origin?.name || null,
    to: departure.destination?.name || null,
    departure: formatTime(departure.departureDateTime),
    arrival: formatTime(departure.arrivalDateTime),
    duration: departure.duration || null,
    durationMinutes: parseIsoDurationToMinutes(departure.duration),
    numberOfChanges: departure.numberOfChanges ?? null,
    numberOfOperators: departure.numberOfOperators ?? null,
    producer: departure.producer || null,
    routeType: classifyRoute(firstLeg, secondLeg),
    firstLeg,
    secondLeg,
    legs: legs.map(mapLeg),
  };
}

function mapDeparturesToTrips(departures) {
  return departures.map(mapDepartureToTrip);
}

module.exports = {
  mapDepartureToTrip,
  mapDeparturesToTrips,
  parseIsoDurationToMinutes,
};
