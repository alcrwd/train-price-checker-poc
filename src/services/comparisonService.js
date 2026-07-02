const { createDataset } = require("./datasetService");
const {
  findMatchingJourneyByFirstLeg,
} = require("./trainMatcher");

const STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE = 98;
const SWEDEN_TIME_ZONE = "Europe/Stockholm";

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

function getStockholmStrategyLegs({ standardJourney, stockholmJourney }) {
  const sjLegs = stockholmJourney?.legs?.length
    ? [stockholmJourney.legs[0]]
    : [];

  const transferLegs = (standardJourney.legs || []).slice(1);

  return [...sjLegs, ...transferLegs].map(mapLegForUi);
}

function getCheapest({ directPrice, stockholmTotalPrice }) {
  const hasDirectPrice = typeof directPrice === "number";
  const hasStockholmPrice = typeof stockholmTotalPrice === "number";

  if (!hasDirectPrice && !hasStockholmPrice) return "none";
  if (hasDirectPrice && !hasStockholmPrice) return "direct";
  if (!hasDirectPrice && hasStockholmPrice) return "stockholm";

  return directPrice <= stockholmTotalPrice ? "direct" : "stockholm";
}

function getPriceDifference({ directPrice, stockholmTotalPrice }) {
  if (
    typeof directPrice !== "number" ||
    typeof stockholmTotalPrice !== "number"
  ) {
    return null;
  }

  return stockholmTotalPrice - directPrice;
}

function createLovableEntriesForDate({
  travelDate,
  standardDataset,
  stockholmDataset,
}) {
  return standardDataset.journeys
    .filter((journey) =>
      shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate)
    )
    .map((standardJourney) => {
      const stockholmJourney = findMatchingJourneyByFirstLeg(
        standardJourney,
        stockholmDataset.journeys
      );

      const stockholmTotalPrice =
        typeof stockholmJourney?.price === "number"
          ? stockholmJourney.price + STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE
          : null;

      const directPrice =
        typeof standardJourney.price === "number" ? standardJourney.price : null;

      return {
        id: standardJourney.id,
        direct: mapJourneyForUi(standardJourney),
        stockholm: stockholmJourney
          ? {
              toStockholm: mapJourneyForUi(stockholmJourney),
              stockholmPrice:
                typeof stockholmJourney.price === "number"
                  ? stockholmJourney.price
                  : null,
              malartagTransferSek:
                typeof stockholmJourney.price === "number"
                  ? STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE
                  : null,
              totalPrice: stockholmTotalPrice,
              departureStatus: normalizeUiStatus(stockholmJourney),
              legs: getStockholmStrategyLegs({
                standardJourney,
                stockholmJourney,
              }),
            }
          : null,
        cheapest: getCheapest({
          directPrice,
          stockholmTotalPrice,
        }),
        priceDifference: getPriceDifference({
          directPrice,
          stockholmTotalPrice,
        }),
      };
    });
}

async function createComparisonResult({ travelDate }) {
  const standardDataset = await createDataset({
    origin: "Malmö Central",
    destination: "Nyköping Central",
    travelDate,
  });

  const stockholmDataset = await createDataset({
    origin: "Malmö Central",
    destination: "Stockholm Central",
    travelDate,
  });

  return {
    generatedAt: new Date().toISOString(),
    search: {
      origin: "Malmö Central",
      destination: "Nyköping Central",
      via: "Stockholm Central",
      travelDate,
      malartagTransferSek: STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE,
    },
    entries: createLovableEntriesForDate({
      travelDate,
      standardDataset,
      stockholmDataset,
    }),
  };
}

module.exports = {
  createComparisonResult,
};
