function findMatchingJourneyByFirstLeg(referenceJourney, candidateJourneys) {
  if (!referenceJourney || referenceJourney.legs.length === 0) {
    return null;
  }

  const referenceLeg = referenceJourney.legs[0];

  return (
    candidateJourneys.find((journey) => {
      if (!journey.legs.length) {
        return false;
      }

      const candidateLeg = journey.legs[0];

      return (
        candidateLeg.operator === referenceLeg.operator &&
        candidateLeg.trainNumber === referenceLeg.trainNumber &&
        candidateLeg.departureTime === referenceLeg.departureTime
      );
    }) || null
  );
}

module.exports = {
  findMatchingJourneyByFirstLeg,
};
