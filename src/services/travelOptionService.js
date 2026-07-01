function getCheapestJourney(dataset) {
  const pricedJourneys = dataset.journeys.filter(
    (journey) => typeof journey.price === "number"
  );

  if (pricedJourneys.length === 0) {
    return null;
  }

  return pricedJourneys.sort((a, b) => a.price - b.price)[0];
}

function createStandardOption(dataset) {
  const journey = getCheapestJourney(dataset);

  if (!journey) {
    return null;
  }

  return {
    type: "standard-ticket",
    label: "Standard ticket",
    totalPrice: journey.price,
    currency: journey.currency,
    journeys: [journey],
    tickets: [
      {
        from: dataset.search.origin,
        to: dataset.search.destination,
        price: journey.price,
        currency: journey.currency,
      },
    ],
  };
}

function createTravelOptions({ standardDataset }) {
  const options = [];

  const standardOption = createStandardOption(standardDataset);

  if (standardOption) {
    options.push(standardOption);
  }

  return {
    generatedAt: new Date().toISOString(),
    search: standardDataset.search,
    options,
  };
}

module.exports = {
  createTravelOptions,
};
