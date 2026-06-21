const NORRKOPING_TO_NYKOPING_PRICE = 98;

function minutesSinceMidnight(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function durationInMinutes(trip) {
  return trip.durationHours * 60 + trip.durationMinutes;
}

function findMatchingTrips(destinationA, destinationB, maxDifferenceMinutes = 15) {
  const matches = [];
  const usedDestinationBIndexes = new Set();

  for (const tripA of destinationA) {
    if (!tripA.price || tripA.soldOut) continue;

    let bestMatch = null;
    let bestMatchIndex = null;
    let bestScore = Infinity;

    for (let i = 0; i < destinationB.length; i++) {
      if (usedDestinationBIndexes.has(i)) continue;

      const tripB = destinationB[i];
      if (!tripB.price || tripB.soldOut) continue;

      const sameTrain =
        tripA.trainNumber &&
        tripB.trainNumber &&
        tripA.trainNumber === tripB.trainNumber;

      const departureDiff = Math.abs(
        minutesSinceMidnight(tripA.departure) -
          minutesSinceMidnight(tripB.departure)
      );

      if (!sameTrain && departureDiff > maxDifferenceMinutes) continue;

      const durationDiff = Math.abs(
        durationInMinutes(tripA) - durationInMinutes(tripB)
      );

      const score = sameTrain ? durationDiff : 1000 + departureDiff * 10 + durationDiff;

      if (score < bestScore) {
        bestScore = score;
        bestMatch = tripB;
        bestMatchIndex = i;
      }
    }

    if (bestMatch) {
      usedDestinationBIndexes.add(bestMatchIndex);

      const alternativePrice =
        bestMatch.price + NORRKOPING_TO_NYKOPING_PRICE;

      matches.push({
        departureA: tripA.departure,
        arrivalA: tripA.arrival,
        trainNumberA: tripA.trainNumber,
        departureB: bestMatch.departure,
        arrivalB: bestMatch.arrival,
        trainNumberB: bestMatch.trainNumber,
        operatorA: tripA.operator,
        operatorB: bestMatch.operator,
        directPrice: tripA.price,
        stockholmPrice: bestMatch.price,
        norrkopingToNykopingPrice: NORRKOPING_TO_NYKOPING_PRICE,
        alternativePrice,
        trueSavings: tripA.price - alternativePrice,
        sameTrainNumber:
          tripA.trainNumber &&
          bestMatch.trainNumber &&
          tripA.trainNumber === bestMatch.trainNumber,
      });
    }
  }

  return matches.sort((a, b) => b.trueSavings - a.trueSavings);
}

module.exports = {
  findMatchingTrips,
};
