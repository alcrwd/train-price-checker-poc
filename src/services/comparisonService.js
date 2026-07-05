const { createDataset } = require("./datasetService");

const {
  "generatedAt": "2026-07-05T22:44:43.577Z",
  "search": {
    "origin": "Malmö Central",
    "destination": "Nyköping Central",
    "via": "Stockholm Central",
    "travelDate": "2026-07-06",
    "malartagTransferSek": 98,
    "direction": "malmo-nykoping"
  },
  "entries": [
    {
      "id": "6bfcbd43-6ee3-32d8-9025-d630b27ad3ae",
      "direct": {
        "id": "6bfcbd43-6ee3-32d8-9025-d630b27ad3ae",
        "departureTime": "05:07",
        "arrivalTime": "09:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 14,
        "price": 2190,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "522",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "522",
            "departureDate": "2026-07-06",
            "departureTime": "05:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "08:16",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "224",
            "departureDate": "2026-07-06",
            "departureTime": "08:30",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "09:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "91d430be-9f4e-3681-888c-95b88526cb9f",
      "direct": {
        "id": "91d430be-9f4e-3681-888c-95b88526cb9f",
        "departureTime": "06:07",
        "arrivalTime": "10:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 12,
        "price": 2190,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "524",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "524",
            "departureDate": "2026-07-06",
            "departureTime": "06:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "09:18",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "226",
            "departureDate": "2026-07-06",
            "departureTime": "09:30",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "10:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "57bdacf3-1c2c-3f10-b189-26012ab2a662",
      "direct": {
        "id": "57bdacf3-1c2c-3f10-b189-26012ab2a662",
        "departureTime": "08:07",
        "arrivalTime": "12:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 11,
        "price": 2190,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "528",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "528",
            "departureDate": "2026-07-06",
            "departureTime": "08:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "11:16",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "230",
            "departureDate": "2026-07-06",
            "departureTime": "11:27",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "12:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "c8f8145c-d002-3fc2-9da4-9f333808e988",
      "direct": {
        "id": "c8f8145c-d002-3fc2-9da4-9f333808e988",
        "departureTime": "09:07",
        "arrivalTime": "13:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 12,
        "price": null,
        "currency": "SEK",
        "departureStatus": "SOLD_OUT",
        "trainNumber": "530",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "530",
            "departureDate": "2026-07-06",
            "departureTime": "09:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "12:16",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "232",
            "departureDate": "2026-07-06",
            "departureTime": "12:28",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "13:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "none",
      "priceDifference": null
    },
    {
      "id": "656da617-1664-3288-9476-c65e4ece4323",
      "direct": {
        "id": "656da617-1664-3288-9476-c65e4ece4323",
        "departureTime": "11:07",
        "arrivalTime": "17:45",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 398,
        "numberOfChanges": 1,
        "totalTransferMinutes": 55,
        "price": null,
        "currency": "SEK",
        "departureStatus": "SOLD_OUT",
        "trainNumber": "534",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "534",
            "departureDate": "2026-07-06",
            "departureTime": "11:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "15:39",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "241",
            "departureDate": "2026-07-06",
            "departureTime": "16:34",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "17:45",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": {
        "toStockholm": {
          "id": "c448c948-6655-3dcb-a52e-6b417cbc8eed",
          "departureTime": "11:07",
          "arrivalTime": "15:39",
          "arrivalDate": "2026-07-06",
          "durationMinutes": 272,
          "numberOfChanges": 0,
          "totalTransferMinutes": 0,
          "price": null,
          "currency": "SEK",
          "departureStatus": "SOLD_OUT",
          "trainNumber": "534",
          "operatorName": "SJ Snabbtåg",
          "brand": "SJ Snabbtåg",
          "legs": [
            {
              "operatorName": "SJ Snabbtåg",
              "trainNumber": "534",
              "departureDate": "2026-07-06",
              "departureTime": "11:07",
              "arrivalDate": "2026-07-06",
              "arrivalTime": "15:39",
              "changeMinutes": null
            }
          ]
        },
        "stockholmPrice": null,
        "malartagTransferSek": null,
        "totalPrice": null,
        "departureStatus": "SOLD_OUT",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "534",
            "departureDate": "2026-07-06",
            "departureTime": "11:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "15:39",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "241",
            "departureDate": "2026-07-06",
            "departureTime": "16:34",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "17:45",
            "changeMinutes": null
          }
        ]
      },
      "cheapest": "none",
      "priceDifference": null
    },
    {
      "id": "df309fcf-7761-356e-aa23-30736b86c3e2",
      "direct": {
        "id": "df309fcf-7761-356e-aa23-30736b86c3e2",
        "departureTime": "12:07",
        "arrivalTime": "16:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 12,
        "price": null,
        "currency": "SEK",
        "departureStatus": "SOLD_OUT",
        "trainNumber": "536",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "536",
            "departureDate": "2026-07-06",
            "departureTime": "12:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "15:16",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "238",
            "departureDate": "2026-07-06",
            "departureTime": "15:28",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "16:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "none",
      "priceDifference": null
    },
    {
      "id": "bab703d5-a5a6-3072-b378-d60f9b4b2941",
      "direct": {
        "id": "bab703d5-a5a6-3072-b378-d60f9b4b2941",
        "departureTime": "13:07",
        "arrivalTime": "17:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 10,
        "price": null,
        "currency": "SEK",
        "departureStatus": "SOLD_OUT",
        "trainNumber": "538",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "538",
            "departureDate": "2026-07-06",
            "departureTime": "13:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "16:20",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "240",
            "departureDate": "2026-07-06",
            "departureTime": "16:30",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "17:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "none",
      "priceDifference": null
    },
    {
      "id": "8777a42c-205c-3de0-9c0f-3b048625daf7",
      "direct": {
        "id": "8777a42c-205c-3de0-9c0f-3b048625daf7",
        "departureTime": "15:07",
        "arrivalTime": "20:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 307,
        "numberOfChanges": 1,
        "totalTransferMinutes": 68,
        "price": 2050,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "542",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "542",
            "departureDate": "2026-07-06",
            "departureTime": "15:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "18:19",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "246",
            "departureDate": "2026-07-06",
            "departureTime": "19:27",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "20:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "08725d76-a9b6-3162-aa1d-3ab4257651fc",
      "direct": {
        "id": "08725d76-a9b6-3162-aa1d-3ab4257651fc",
        "departureTime": "16:07",
        "arrivalTime": "21:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 307,
        "numberOfChanges": 1,
        "totalTransferMinutes": 70,
        "price": 2190,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "544",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "544",
            "departureDate": "2026-07-06",
            "departureTime": "16:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "19:18",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "248",
            "departureDate": "2026-07-06",
            "departureTime": "20:28",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "21:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "dcab8ae4-1f32-380c-8965-b313c5379880",
      "direct": {
        "id": "dcab8ae4-1f32-380c-8965-b313c5379880",
        "departureTime": "16:18",
        "arrivalTime": "21:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 296,
        "numberOfChanges": 1,
        "totalTransferMinutes": 40,
        "price": null,
        "currency": "SEK",
        "departureStatus": "NO_OFFERS",
        "trainNumber": "306",
        "operatorName": "Snälltåget tåg",
        "brand": "Snälltåget tåg",
        "legs": [
          {
            "operatorName": "Snälltåget tåg",
            "trainNumber": "306",
            "departureDate": "2026-07-06",
            "departureTime": "16:18",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "19:48",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "248",
            "departureDate": "2026-07-06",
            "departureTime": "20:28",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "21:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "none",
      "priceDifference": null
    },
    {
      "id": "05ef29a9-308c-3604-ab65-39ee17d673af",
      "direct": {
        "id": "05ef29a9-308c-3604-ab65-39ee17d673af",
        "departureTime": "18:07",
        "arrivalTime": "22:14",
        "arrivalDate": "2026-07-06",
        "durationMinutes": 247,
        "numberOfChanges": 1,
        "totalTransferMinutes": 14,
        "price": 2050,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "548",
        "operatorName": "SJ Snabbtåg",
        "brand": "SJ Snabbtåg",
        "legs": [
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "548",
            "departureDate": "2026-07-06",
            "departureTime": "18:07",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "21:16",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "250",
            "departureDate": "2026-07-06",
            "departureTime": "21:30",
            "arrivalDate": "2026-07-06",
            "arrivalTime": "22:14",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "8bde2bcd-3c82-31ca-8fd0-9cb9f3664f4c",
      "direct": {
        "id": "8bde2bcd-3c82-31ca-8fd0-9cb9f3664f4c",
        "departureTime": "22:17",
        "arrivalTime": "06:08",
        "arrivalDate": "2026-07-07",
        "durationMinutes": 471,
        "numberOfChanges": 1,
        "totalTransferMinutes": 64,
        "price": 730,
        "currency": "SEK",
        "departureStatus": "PRICED",
        "trainNumber": "2",
        "operatorName": "SJ Nattåg",
        "brand": "SJ Nattåg",
        "legs": [
          {
            "operatorName": "SJ Nattåg",
            "trainNumber": "2",
            "departureDate": "2026-07-06",
            "departureTime": "22:17",
            "arrivalDate": "2026-07-07",
            "arrivalTime": "04:22",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "218",
            "departureDate": "2026-07-07",
            "departureTime": "05:26",
            "arrivalDate": "2026-07-07",
            "arrivalTime": "06:08",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "direct",
      "priceDifference": null
    },
    {
      "id": "10d35c2d-5a72-35eb-a180-d625c221ccd0",
      "direct": {
        "id": "10d35c2d-5a72-35eb-a180-d625c221ccd0",
        "departureTime": "22:45",
        "arrivalTime": "09:45",
        "arrivalDate": "2026-07-07",
        "durationMinutes": 660,
        "numberOfChanges": 2,
        "totalTransferMinutes": 160,
        "price": null,
        "currency": "SEK",
        "departureStatus": "SOLD_OUT",
        "trainNumber": "675",
        "operatorName": "Vy Bus4You Expressbuss",
        "brand": "Vy Bus4You Expressbuss",
        "legs": [
          {
            "operatorName": "Vy Bus4You Expressbuss",
            "trainNumber": "675",
            "departureDate": "2026-07-06",
            "departureTime": "22:45",
            "arrivalDate": "2026-07-07",
            "arrivalTime": "02:10",
            "changeMinutes": null
          },
          {
            "operatorName": "SJ Snabbtåg",
            "trainNumber": "400",
            "departureDate": "2026-07-07",
            "departureTime": "04:19",
            "arrivalDate": "2026-07-07",
            "arrivalTime": "08:32",
            "changeMinutes": null
          },
          {
            "operatorName": "Mälartåg",
            "trainNumber": "225",
            "departureDate": "2026-07-07",
            "departureTime": "09:03",
            "arrivalDate": "2026-07-07",
            "arrivalTime": "09:45",
            "changeMinutes": null
          }
        ]
      },
      "stockholm": null,
      "cheapest": "none",
      "priceDifference": null
    }
  ],
  "cache": {
    "status": "refreshed",
    "cachedAt": "2026-07-05T22:44:43.578Z",
    "refreshInProgress": false
  }
}SWEDEN_TIME_ZONE = "Europe/Stockholm";

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

function legsMatch(directLeg, comparisonLeg) {
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
