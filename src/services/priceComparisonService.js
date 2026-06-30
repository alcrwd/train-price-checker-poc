function compareSnapshots(previousSnapshot, currentSnapshot) {
  const previousTrips = new Map(
    previousSnapshot.trips.map((trip) => [trip.id, trip])
  );

  const currentTrips = new Map(
    currentSnapshot.trips.map((trip) => [trip.id, trip])
  );

  const addedTrips = [];
  const removedTrips = [];
  const cheaperTrips = [];
  const moreExpensiveTrips = [];
  const unchangedTrips = [];

  for (const currentTrip of currentSnapshot.trips) {
    const previousTrip = previousTrips.get(currentTrip.id);

    if (!previousTrip) {
      addedTrips.push(currentTrip);
      continue;
    }

    if (
      typeof previousTrip.price !== "number" ||
      typeof currentTrip.price !== "number"
    ) {
      unchangedTrips.push(currentTrip);
      continue;
    }

    const difference = currentTrip.price - previousTrip.price;

    if (difference < 0) {
      cheaperTrips.push({
        id: currentTrip.id,
        departure: currentTrip.departure,
        arrival: currentTrip.arrival,
        previousPrice: previousTrip.price,
        currentPrice: currentTrip.price,
        difference,
      });
    } else if (difference > 0) {
      moreExpensiveTrips.push({
        id: currentTrip.id,
        departure: currentTrip.departure,
        arrival: currentTrip.arrival,
        previousPrice: previousTrip.price,
        currentPrice: currentTrip.price,
        difference,
      });
    } else {
      unchangedTrips.push(currentTrip);
    }
  }

  for (const previousTrip of previousSnapshot.trips) {
    if (!currentTrips.has(previousTrip.id)) {
      removedTrips.push(previousTrip);
    }
  }

  const previousLowest = previousSnapshot.lowestPrice;
  const currentLowest = currentSnapshot.lowestPrice;

  return {
    route: currentSnapshot.route,
    date: currentSnapshot.date,

    previousScan: previousSnapshot.scannedAt,
    currentScan: currentSnapshot.scannedAt,

    previousLowestPrice: previousLowest,
    currentLowestPrice: currentLowest,
    lowestPriceDifference:
      typeof previousLowest === "number" &&
      typeof currentLowest === "number"
        ? currentLowest - previousLowest
        : null,

    summary: {
      addedTrips: addedTrips.length,
      removedTrips: removedTrips.length,
      cheaperTrips: cheaperTrips.length,
      moreExpensiveTrips: moreExpensiveTrips.length,
      unchangedTrips: unchangedTrips.length,
    },

    addedTrips,
    removedTrips,
    cheaperTrips,
    moreExpensiveTrips,
  };
}

module.exports = {
  compareSnapshots,
};
