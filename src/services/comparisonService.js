const { createDataset } = require("./datasetService");

const SWEDEN_TIME_ZONE = "Europe/Stockholm";

const BOOKING_HUBS = {
  "malmo-nykoping": [
    {
      id: "sodertalje-syd",
      label: "Södertälje",
      station: "Södertälje Syd",
      transferCostSek: 0,
      comparison: {
        origin: "Malmö Central",
        destination: "Södertälje Syd",
      },
      match: {
        directLegIndex: 0,
        comparisonLegIndex: 0,
      },
      includeNextDayComparison: false,
      requireArrivalTimeMatch: false,
    },
  ],

  "nykoping-malmo": [
    {
      id: "stockholm",
      label: "Stockholm",
      station: "Stockholm Central",
      transferCostSek: 98,
      comparison: {
        origin: "Stockholm Central",
        destination: "Malmö Central",
      },
      match: {
        directLegIndex: 1,
        comparisonLegIndex: 0,
      },
      includeNextDayComparison: true,
      requireArrivalTimeMatch: true,
    },
    {
      id: "sodertalje-syd",
      label: "Södertälje",
      station: "Södertälje Syd",
      transferCostSek: 0,
      comparison: {
        origin: "Södertälje Syd",
        destination: "Malmö Central",
      },
      match: {
        directLegIndex: 1,
        comparisonLegIndex: 0,
      },
      includeNextDayComparison: true,
      requireArrivalTimeMatch: true,
    },
  ],
};

const STRATEGIES = {
  "malmo-nykoping": {
    direction: "malmo-nykoping",
    origin: "Malmö Central",
    destination: "Nyköping Central",
    via: "Stockholm Central",
    bookingHubs: BOOKING_HUBS["malmo-nykoping"],
  },

  "nykoping-malmo": {
    direction: "nykoping-malmo",
    origin: "Nyköping Central",
    destination: "Malmö Central",
    via: "Stockholm Central",
    bookingHubs: BOOKING_HUBS["nykoping-malmo"],
  },
};

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getStrategy(direction = "malmo-nykoping") {
  const strategy = STRATEGIES[direction];
  if (!strategy) throw new Error(`Unsupported direction: ${direction}`);
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

function legsMatch(directLeg, comparisonLeg, hub) {
  if (!directLeg || !comparisonLeg) return false;

  const directTrainNumber = normalizeText(directLeg.trainNumber);
  const comparisonTrainNumber = normalizeText(comparisonLeg.trainNumber);

  if (!directTrainNumber || !comparisonTrainNumber) return false;
  if (directTrainNumber !== comparisonTrainNumber) return false;

  const directOperator = normalizeText(directLeg.operator);
  const comparisonOperator = normalizeText(comparisonLeg.operator);

  if (
    directOperator &&
    comparisonOperator &&
    directOperator !== comparisonOperator
  ) {
    return false;
  }

  if (
    hub.requireArrivalTimeMatch &&
    directLeg.arrivalTime &&
    comparisonLeg.arrivalTime &&
    directLeg.arrivalTime !== comparisonLeg.arrivalTime
  ) {
    return false;
  }

  return true;
}

function findMatchingJourneyByHub(standardJourney, comparisonJourneys, hub) {
  const directLeg = standardJourney.legs?.[hub.match.directLegIndex];

  return comparisonJourneys.find((comparisonJourney) => {
    const comparisonLeg = comparisonJourney.legs?.[hub.match.comparisonLegIndex];
    return legsMatch(directLeg, comparisonLeg, hub);
  });
}

function getAlternativeLegs({ standardJourney, comparisonJourney, hub, direction }) {
  if (!comparisonJourney) return [];

  if (direction === "malmo-nykoping") {
    const sjLegs = comparisonJourney.legs?.length
      ? [comparisonJourney.legs[0]]
      : [];

    const transferLegs = (standardJourney.legs || []).slice(1);

    return [...sjLegs, ...transferLegs].map(mapLegForUi);
  }

  if (direction === "nykoping-malmo") {
    const transferLegs = (standardJourney.legs || []).slice(
      0,
      hub.match.directLegIndex
    );

    const sjLegs = comparisonJourney.legs || [];

    return [...transferLegs, ...sjLegs].map(mapLegForUi);
  }

  return (comparisonJourney.legs || []).map(mapLegForUi);
}

function getCheapest({ directPrice, bestAlternativeTotalPrice }) {
  const hasDirectPrice = typeof directPrice === "number";
  const hasAlternativePrice = typeof bestAlternativeTotalPrice === "number";

  if (!hasDirectPrice && !hasAlternativePrice) return "none";
  if (hasDirectPrice && !hasAlternativePrice) return "direct";
  if (!hasDirectPrice && hasAlternativePrice) return "alternative";

  return directPrice <= bestAlternativeTotalPrice ? "direct" : "alternative";
}

function getPriceDifference({ directPrice, alternativeTotalPrice }) {
  if (
    typeof directPrice !== "number" ||
    typeof alternativeTotalPrice !== "number"
  ) {
    return null;
  }

  return alternativeTotalPrice - directPrice;
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

async function createComparisonDatasetForHub({ hub, travelDate }) {
  const primaryDataset = await createDataset({
    origin: hub.comparison.origin,
    destination: hub.comparison.destination,
    travelDate,
  });

  if (!hub.includeNextDayComparison) {
    return primaryDataset;
  }

  const nextDayDataset = await createDataset({
    origin: hub.comparison.origin,
    destination: hub.comparison.destination,
    travelDate: addDays(travelDate, 1),
  });

  return mergeComparisonDatasets([primaryDataset, nextDayDataset]);
}

async function createComparisonDatasetsByHub({ strategy, travelDate }) {
  const datasetsByHubId = {};

  for (const hub of strategy.bookingHubs) {
    datasetsByHubId[hub.id] = await createComparisonDatasetForHub({
      hub,
      travelDate,
    });
  }

  return datasetsByHubId;
}

function createAlternativeForHub({
  standardJourney,
  comparisonDataset,
  hub,
  direction,
  directPrice,
}) {
  const comparisonJourney = findMatchingJourneyByHub(
    standardJourney,
    comparisonDataset.journeys,
    hub
  );

  const sjPrice =
    typeof comparisonJourney?.price === "number" ? comparisonJourney.price : null;

  const totalPrice =
    typeof sjPrice === "number" ? sjPrice + hub.transferCostSek : null;

  return {
    id: hub.id,
    label: hub.label,
    station: hub.station,
    sjPrice,
    transferCostSek: typeof sjPrice === "number" ? hub.transferCostSek : null,
    totalPrice,
    status: comparisonJourney ? normalizeUiStatus(comparisonJourney) : "NO_OFFERS",
    priceDifference: getPriceDifference({
      directPrice,
      alternativeTotalPrice: totalPrice,
    }),
    journey: comparisonJourney ? mapJourneyForUi(comparisonJourney) : null,
    legs: comparisonJourney
      ? getAlternativeLegs({
          standardJourney,
          comparisonJourney,
          hub,
          direction,
        })
      : [],
  };
}

function getBestAlternative(alternatives) {
  const pricedAlternatives = alternatives.filter(
    (alternative) => typeof alternative.totalPrice === "number"
  );

  if (pricedAlternatives.length === 0) return null;

  return pricedAlternatives.reduce((best, current) =>
    current.totalPrice < best.totalPrice ? current : best
  );
}

function getFallbackAlternative(alternatives) {
  if (!alternatives.length) return null;

  const soldOut = alternatives.find((alternative) => alternative.status === "SOLD_OUT");
  if (soldOut) return soldOut;

  return alternatives[0];
}

function mapAlternativeToLegacyStockholm(alternative) {
  if (!alternative) return null;

  return {
    toStockholm: alternative.journey,
    stockholmPrice: alternative.sjPrice,
    malartagTransferSek: alternative.transferCostSek,
    totalPrice: alternative.totalPrice,
    departureStatus: alternative.status,
    legs: alternative.legs,
    hubId: alternative.id,
    label: alternative.label,
    station: alternative.station,
  };
}

function createLovableEntriesForDate({
  travelDate,
  standardDataset,
  comparisonDatasetsByHub,
  strategy,
}) {
  return standardDataset.journeys
    .filter((journey) =>
      shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate)
    )
    .map((standardJourney) => {
      const directPrice =
        typeof standardJourney.price === "number" ? standardJourney.price : null;

      const alternatives = strategy.bookingHubs.map((hub) =>
        createAlternativeForHub({
          standardJourney,
          comparisonDataset: comparisonDatasetsByHub[hub.id],
          hub,
          direction: strategy.direction,
          directPrice,
        })
      );

      const bestAlternative = getBestAlternative(alternatives);
      const displayAlternative = bestAlternative || getFallbackAlternative(alternatives);

      const cheapest = getCheapest({
        directPrice,
        bestAlternativeTotalPrice: bestAlternative?.totalPrice ?? null,
      });

      return {
        id: standardJourney.id,
        direct: mapJourneyForUi(standardJourney),

        alternatives,
        bestAlternativeId: bestAlternative?.id || null,
        bestAlternativeLabel: bestAlternative?.label || null,

        // Legacy field kept so the existing frontend does not break yet.
        stockholm: mapAlternativeToLegacyStockholm(displayAlternative),

        cheapest:
          cheapest === "alternative"
            ? displayAlternative?.id || "stockholm"
            : cheapest,

        priceDifference: getPriceDifference({
          directPrice,
          alternativeTotalPrice: bestAlternative?.totalPrice ?? null,
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

  const comparisonDatasetsByHub = await createComparisonDatasetsByHub({
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
      malartagTransferSek: 98,
      direction: strategy.direction,
      bookingHubs: strategy.bookingHubs.map((hub) => ({
        id: hub.id,
        label: hub.label,
        station: hub.station,
        transferCostSek: hub.transferCostSek,
      })),
    },
    entries: createLovableEntriesForDate({
      travelDate,
      standardDataset,
      comparisonDatasetsByHub,
      strategy,
    }),
  };
}

module.exports = {
  createComparisonResult,
};
