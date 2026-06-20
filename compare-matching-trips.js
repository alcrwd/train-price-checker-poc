function minutesSinceMidnight(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function findMatchingTrips(destinationA, destinationB, maxDifferenceMinutes = 15) {
  const matches = [];

  for (const tripA of destinationA) {
    if (!tripA.price || tripA.soldOut) continue;

    const departureA = minutesSinceMidnight(tripA.departure);

    let bestMatch = null;
    let bestDiff = Infinity;

    for (const tripB of destinationB) {
      if (!tripB.price || tripB.soldOut) continue;

      const departureB = minutesSinceMidnight(tripB.departure);
      const diff = Math.abs(departureA - departureB);

      if (diff <= maxDifferenceMinutes && diff < bestDiff) {
        bestDiff = diff;
        bestMatch = tripB;
      }
    }

    if (bestMatch) {
      matches.push({
        departureA: tripA.departure,
        departureB: bestMatch.departure,
        operatorA: tripA.operator,
        operatorB: bestMatch.operator,
        priceA: tripA.price,
        priceB: bestMatch.price,
        savings: tripA.price - bestMatch.price,
      });
    }
  }

  return matches.sort((a, b) => b.savings - a.savings);
}

module.exports = {
  findMatchingTrips,
};