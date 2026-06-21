function minutesSinceMidnight(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function durationInMinutes(trip) {
  return trip.durationHours * 60 + trip.durationMinutes;
}

function normalizeOperator(operator) {
  if (!operator) return "";

  if (operator.includes("Snälltåget")) return "snalltaget";
  if (operator.includes("SJ Nattåg")) return "sj-nattag";
  if (operator.includes("SJ Snabbtåg")) return "sj-snabbtag";
  if (operator.includes("Mälartåg")) return "malartag";

  return operator.toLowerCase();
}

function getMatchScore(tripA, tripB) {
  const departureDiff = Math.abs(
    minutesSinceMidnight(tripA.departure) - minutesSinceMidnight(tripB.departure)
  );

  const durationDiff = Math.abs(durationInMinutes(tripA) - durationInMinutes(tripB));

  const operatorA = normalizeOperator(tripA.operator);
  const operatorB = normalizeOperator(tripB.operator);

  const sameOperatorFamily = operatorA && operatorB && operatorA === operatorB;

  return {
    departureDiff,
    durationDiff,
    sameOperatorFamily,
    score:
      departureDiff * 10 +
      durationDiff +
      (sameOperatorFamily ? 0 : 120),
  };
}

function findMatchingTrips(destinationA, destinationB, maxDifferenceMinutes = 15) {
  const matches = [];
  const usedDestinationBIndexes = new Set();

  for (const tripA of destinationA) {
    if (!tripA.price || tripA.soldOut) continue;

    let bestMatch = null;
    let bestMatchIndex = null;
    let bestScore = Infinity;
    let bestMeta = null;

    for (let i = 0; i < destinationB.length; i++) {
      if (usedDestinationBIndexes.has(i)) continue;

      const tripB = destinationB[i];

      if (!tripB.price || tripB.soldOut) continue;

      const meta = getMatchScore(tripA, tripB);

      if (meta.departureDiff > maxDifferenceMinutes) continue;

      if (meta.score < bestScore) {
        bestScore = meta.score;
        bestMatch = tripB;
        bestMatchIndex = i;
        bestMeta = meta;
      }
    }

    if (bestMatch) {
      usedDestinationBIndexes.add(bestMatchIndex);

      matches.push({
        departureA: tripA.departure,
        arrivalA: tripA.arrival,
        departureB: bestMatch.departure,
        arrivalB: bestMatch.arrival,
        operatorA: tripA.operator,
        operatorB: bestMatch.operator,
        priceA: tripA.price,
        priceB: bestMatch.price,
        savings: tripA.price - bestMatch.price,
        departureDiffMinutes: bestMeta.departureDiff,
        durationDiffMinutes: bestMeta.durationDiff,
        sameOperatorFamily: bestMeta.sameOperatorFamily,
      });
    }
  }

  return matches.sort((a, b) => b.savings - a.savings);
}

module.exports = {
  findMatchingTrips,
};
