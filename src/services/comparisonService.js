const { createDataset } = require("./datasetService");

const SWEDEN_TIME_ZONE = "Europe/Stockholm";

const STRATEGIES = {
  "malmo-nykoping": {
    direction: "malmo-nykoping",
    origin: "Malmö Central",
    destination: "Nyköping Central",
    via: "Stockholm Central",
    comparison: {
      origin: "Malmö Central",
      destination: "Stockholm Central",
    },
    transferPrice: 98,
    match: {
      directLegIndex: 0,
      comparisonLegIndex: 0,
    },
    includeNextDayComparison: false,
  },

  "nykoping-malmo": {
    direction: "nykoping-malmo",
    origin: "Nyköping Central",
    destination: "Malmö Central",
    via: "Stockholm Central",
    comparison: {
      origin: "Stockholm Central",
      destination: "Malmö Central",
    },
    transferPrice: 98,
    match: {
      directLegIndex: 1,
      comparisonLegIndex: 0,
    },
    includeNextDayComparison: true,
  },
};

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getStrategy(direction = "malmo-nykoping") {
  const strategy = STRATEGIES[direction];

  if (!strategy) {
    throw new Error(`Unsupported direction: ${direction}`);
  }

  return strategy;
}

function timeToMinutes(time) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getSwedenDateTimeParts() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: SWEDEN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate) {
  const swedenNow = getSwedenDateTimeParts();

  if (travelDate !== swedenNow.date) return true;

  const departureMinutes = timeToMinutes(journey.departureTime);
  if (departureMinutes === null) return false;

  return departureMinutes >= swedenNow.minutes;
}

function normalizeUiStatus(journey) {
  if (typeof journey?.price === "number") return "PRICED";
  if (journey?.departureStatus === "SOLD_OUT") return "SOLD_OUT";
  return "NO_OFFERS";
}

function mapLegForUi(leg) {
  return {
    operatorName: leg.operator || null,
    trainNumber: leg.trainNumber || null,
    departureDate: leg.departureDate || null,
    departureTime: leg.departureTime || null,
    arrivalDate: leg.arrivalDate || null,
    arrivalTime: leg.arrivalTime || null,
    changeMinutes:
      typeof leg.changeMinutes === "number" ? leg.changeMinutes : null,
  };
}

function mapJourneyForUi(journey) {
  const firstLeg = journey.legs?.[0] || {};

  return {
    id: journey.id,
    departureTime: journey.departureTime,
    arrivalTime: journey.arrivalTime,
    arrivalDate: journey.arrivalDate,
    durationMinutes: journey.durationMinutes,
    numberOfChanges: journey.numberOfChanges,
    totalTransferMinutes: journey.totalTransferMinutes,
    price: typeof journey.price === "number" ? journey.price : null,
    currency: "SEK",
    departureStatus: normalizeUiStatus(journey),
    trainNumber: firstLeg.trainNumber || null,
    operatorName: firstLeg.operator || null,
    brand: firstLeg.operator || null,
    legs: (journey.legs || []).map(mapLegForUi),
  };
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function function legsMatch(directLeg, comparisonLeg) {
  if (!directLeg || !comparisonLeg) return false;

  const directTrainNumber = normalizeText(directLeg.trainNumber);
  const comparisonTrainNumber = normalizeText(comparisonLeg.trainNumber);

  if (!directTrainNumber || !comparisonTrainNumber) return false;
  if (directTrainNumber !== comparisonTrainNumber) return false;

  const directOperator = normalizeText(directLeg.operator);
  const comparisonOperator = normalizeText(comparisonLeg.operator);

  if (directOperator && comparisonOperator && directOperator !== comparisonOperator) {
    return false;
  }

  if (
    directLeg.arrivalTime &&
    comparisonLeg.arrivalTime &&
    directLeg.arrivalTime !== comparisonLeg.arrivalTime
  ) {
    return false;
  }

  return true;
}

function findMatchingJourneyByStrategy(
  standardJourney,
  comparisonJourneys,
  strategy
) {
  const directLeg = standardJourney.legs?.[strategy.match.directLegIndex];

  return comparisonJourneys.find((comparisonJourney) => {
    const comparisonLeg =
      comparisonJourney.legs?.[strategy.match.comparisonLegIndex];

    return legsMatch(directLeg, comparisonLeg);
  });
}

function getStrategyLegs({ standardJourney, comparisonJourney, strategy }) {
  if (!comparisonJourney) return [];

  if (strategy.direction === "malmo-nykoping") {
    const sjLegs = comparisonJourney.legs?.length
      ? [comparisonJourney.legs[0]]
      : [];

    const transferLegs = (standardJourney.legs || []).slice(1);

    return [...sjLegs, ...transferLegs].map(mapLegForUi);
  }

  if (strategy.direction === "nykoping-malmo") {
    const transferLegs = (standardJourney.legs || []).slice(
      0,
      strategy.match.directLegIndex
    );

    const sjLegs = comparisonJourney.legs || [];

    return [...transferLegs, ...sjLegs].map(mapLegForUi);
  }

  return (comparisonJourney.legs || []).map(mapLegForUi);
}

function getCheapest({ directPrice, strategyTotalPrice }) {
  const hasDirectPrice = typeof directPrice === "number";
  const hasStrategyPrice = typeof strategyTotalPrice === "number";

  if (!hasDirectPrice && !hasStrategyPrice) return "none";
  if (hasDirectPrice && !hasStrategyPrice) return "direct";
  if (!hasDirectPrice && hasStrategyPrice) return "stockholm";

  return directPrice <= strategyTotalPrice ? "direct" : "stockholm";
}

function getPriceDifference({ directPrice, strategyTotalPrice }) {
  if (
    typeof directPrice !== "number" ||
    typeof strategyTotalPrice !== "number"
  ) {
    return null;
  }

  return strategyTotalPrice - directPrice;
}

function mergeComparisonDatasets(datasets) {
  const journeysById = new Map();

  for (const dataset of datasets) {
    for (const journey of dataset.journeys || []) {
      journeysById.set(journey.id, journey);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    search: datasets[0]?.search || null,
    journeys: Array.from(journeysById.values()),
  };
}

async function createComparisonDataset({ strategy, travelDate }) {
  const primaryDataset = await createDataset({
    origin: strategy.comparison.origin,
    destination: strategy.comparison.destination,
    travelDate,
  });

  if (!strategy.includeNextDayComparison) {
    return primaryDataset;
  }

  const nextDayDataset = await createDataset({
    origin: strategy.comparison.origin,
    destination: strategy.comparison.destination,
    travelDate: addDays(travelDate, 1),
  });

  return mergeComparisonDatasets([primaryDataset, nextDayDataset]);
}

function createLovableEntriesForDate({
  travelDate,
  standardDataset,
  comparisonDataset,
  strategy,
}) {
  return standardDataset.journeys
    .filter((journey) =>
      shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate)
    )
    .map((standardJourney) => {
      const comparisonJourney = findMatchingJourneyByStrategy(
        standardJourney,
        comparisonDataset.journeys,
        strategy
      );

      const strategyTotalPrice =
        typeof comparisonJourney?.price === "number"
          ? comparisonJourney.price + strategy.transferPrice
          : null;

      const directPrice =
        typeof standardJourney.price === "number" ? standardJourney.price : null;

      return {
        id: standardJourney.id,
        direct: mapJourneyForUi(standardJourney),
        stockholm: comparisonJourney
          ? {
              toStockholm: mapJourneyForUi(comparisonJourney),
              stockholmPrice:
                typeof comparisonJourney.price === "number"
                  ? comparisonJourney.price
                  : null,
              malartagTransferSek:
                typeof comparisonJourney.price === "number"
                  ? strategy.transferPrice
                  : null,
              totalPrice: strategyTotalPrice,
              departureStatus: normalizeUiStatus(comparisonJourney),
              legs: getStrategyLegs({
                standardJourney,
                comparisonJourney,
                strategy,
              }),
            }
          : null,
        cheapest: getCheapest({
          directPrice,
          strategyTotalPrice,
        }),
        priceDifference: getPriceDifference({
          directPrice,
          strategyTotalPrice,
        }),
      };
    });
}

async function createComparisonResult({
  travelDate,
  direction = "malmo-nykoping",
}) {
  const strategy = getStrategy(direction);

  const standardDataset = await createDataset({
    origin: strategy.origin,
    destination: strategy.destination,
    travelDate,
  });

  const comparisonDataset = await createComparisonDataset({
    strategy,
    travelDate,
  });

  return {
    generatedAt: new Date().toISOString(),
    search: {
      origin: strategy.origin,
      destination: strategy.destination,
      via: strategy.via,
      travelDate,
      malartagTransferSek: strategy.transferPrice,
      direction: strategy.direction,
    },
    entries: createLovableEntriesForDate({
      travelDate,
      standardDataset,
      comparisonDataset,
      strategy,
    }),
  };
}

module.exports = {
  createComparisonResult,
};
