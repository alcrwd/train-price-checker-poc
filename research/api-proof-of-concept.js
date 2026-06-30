const { chromium } = require("playwright");
const fs = require("fs");

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

function formatTime(dateTime) {
  if (!dateTime) return null;
  return dateTime.slice(11, 16);
}

function formatLeg(leg) {
  return {
    from: leg.origin?.name || null,
    to: leg.destination?.name || null,
    departure: formatTime(leg.departureDateTime),
    arrival: formatTime(leg.arrivalDateTime),
    trainNumber: leg.publicServiceName || leg.serviceName || null,
    operator: leg.serviceType?.name || null,
    brand: leg.serviceBrandNameDescription || null,
    changeTime: leg.changeTime || null,
  };
}

function simplifyDeparture(departure) {
  const legs = departure.legs || [];
  const firstLeg = legs[0] || null;
  const secondLeg = legs[1] || null;

  return {
    departureId: departure.departureId,
    departure: formatTime(departure.departureDateTime),
    arrival: formatTime(departure.arrivalDateTime),
    duration: departure.duration,
    numberOfChanges: departure.numberOfChanges,
    firstLegTrainNumber: firstLeg
      ? firstLeg.publicServiceName || firstLeg.serviceName || null
      : null,
    firstLegOperator: firstLeg ? firstLeg.serviceType?.name || null : null,
    norrkopingArrival:
      firstLeg &&
      firstLeg.destination?.name === "Norrköping Central"
        ? formatTime(firstLeg.arrivalDateTime)
        : null,
    changeTimeAtNorrkoping:
      firstLeg &&
      firstLeg.destination?.name === "Norrköping Central"
        ? firstLeg.changeTime
        : null,
    secondLegTrainNumber: secondLeg
      ? secondLeg.publicServiceName || secondLeg.serviceName || null
      : null,
    secondLegOperator: secondLeg ? secondLeg.serviceType?.name || null : null,
    norrkopingDeparture:
      secondLeg &&
      secondLeg.origin?.name === "Norrköping Central"
        ? formatTime(secondLeg.departureDateTime)
        : null,
    legs: legs.map(formatLeg),
  };
}

(async () => {
  const date = process.argv[2] || "2026-07-15";

  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const departuresSearchResponses = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!responseUrl.includes("/departures/search/")) return;
    if (!contentType.includes("application/json")) return;

    try {
      const json = await response.json();
      departuresSearchResponses.push({
        url: responseUrl,
        json,
      });
    } catch (error) {
      console.error("Kunde inte läsa JSON från departures/search:", error);
    }
  });

  const url = buildSjUrl("Malmö Central", "Nyköping Central", date);

  console.log(`Öppnar: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(15000);

  const allDepartures = [];

  for (const response of departuresSearchResponses) {
    const travels = response.json.travels || [];

    for (const travel of travels) {
      const departures = travel.departures || [];

      for (const departure of departures) {
        allDepartures.push(simplifyDeparture(departure));
      }
    }
  }

  fs.writeFileSync(
    "api-proof-of-concept-result.json",
    JSON.stringify(
      {
        date,
        fromStation: "Malmö Central",
        toStation: "Nyköping Central",
        numberOfDepartures: allDepartures.length,
        departures: allDepartures,
      },
      null,
      2
    )
  );

  console.log("=================================");
  console.log("API Proof of Concept");
  console.log("=================================");
  console.log(`Datum: ${date}`);
  console.log(`Antal resor: ${allDepartures.length}`);
  console.log("");

  for (const departure of allDepartures) {
    console.log(
      `${departure.departure} → ${departure.arrival} | ` +
        `första tåg: ${departure.firstLegTrainNumber || "-"} ` +
        `(${departure.firstLegOperator || "-"}) | ` +
        `Norrköping ankomst: ${departure.norrkopingArrival || "-"} | ` +
        `byte: ${departure.changeTimeAtNorrkoping || "-"} | ` +
        `andra tåg: ${departure.secondLegTrainNumber || "-"} ` +
        `(${departure.secondLegOperator || "-"}) | ` +
        `Norrköping avgång: ${departure.norrkopingDeparture || "-"}`
    );
  }

  console.log("");
  console.log("Resultat sparat till api-proof-of-concept-result.json");

  await browser.close();
})();
