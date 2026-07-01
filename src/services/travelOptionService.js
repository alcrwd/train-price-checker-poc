const {
  findMatchingJourneyByFirstLeg,
} = require("./trainMatcher");

function getCheapestJourney(dataset) {
  const pricedJourneys = dataset.journeys.filter(
    (journey) => typeof journey.price === "number"
  );

  if (pricedJourneys.length === 0) {
    return null;
  }

  return [...pricedJourneys].sort((a, b) => a.price - b.price)[0];
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
    tickets: [
      {
        from: dataset.search.origin,
        to: dataset.search.destination,
        price: journey.price,
        currency: journey.currency,
      },
    ],
    journeys: [journey],
  };
}

function createStockholmOption({
  standardJourney,
  stockholmDataset,
  norrkopingDataset,
}) {
  if (!standardJourney || !stockholmDataset || !norrkopingDataset) {
    return null;
  }

  const stockholmJourney = findMatchingJourneyByFirstLeg(
    standardJourney,
    stockholmDataset.journeys
  );

  if (!stockholmJourney) {
    return null;
  }

  const norrkopingJourney = getCheapestJourney(norrkopingDataset);

  if (!norrkopingJourney) {
    return null;
  }

  const totalPrice = stockholmJourney.price + norrkopingJourney.price;

  return {
    type: "stockholm-ticket-plus-transfer",
    label: "Stockholm ticket + Norrköping transfer",
    totalPrice,
    currency: "SEK",
    tickets: [
      {
        from: stockholmDataset.search.origin,
        to: stockholmDataset.search.destination,
        price: stockholmJourney.price,
        currency: stockholmJourney.currency,
        note: "Buy this ticket and leave the train at Norrköping Central.",
      },
      {
        from: norrkopingDataset.search.origin,
        to: norrkopingDataset.search.destination,
        price: norrkopingJourney.price,
        currency: norrkopingJourney.currency,
      },
    ],
    journeys: [stockholmJourney, norrkopingJourney],
  };
}

function createTravelOptions({
  standardDataset,
  stockholmDataset,
  norrkopingDataset,
}) {
  const options = [];

  const standardOption = createStandardOption(standardDataset);

  if (standardOption) {
    options.push(standardOption);
  }

  const standardJourney = standardOption?.journeys?.[0];

  const stockholmOption = createStockholmOption({
    standardJourney,
    stockholmDataset,
    norrkopingDataset,
  });

  if (stockholmOption) {
    options.push(stockholmOption);
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
