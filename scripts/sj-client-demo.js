const fs = require("fs");
const { chromium } = require("playwright");
const { createClient } = require("../src/lib/sj/client");

function formatLegs(departure) {
  return (departure.legs || [])
    .map((leg) => {
      const operator = leg.serviceType?.name || "Unknown";
      const train = leg.publicServiceName || leg.serviceName || "?";
      return `${operator} ${train}`;
    })
    .join(" + ");
}

async function main() {
  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const fromStation = "Malmö Central";
  const toStation = "Nyköping Central";
  const departureDate = process.argv[2] || "2026-07-15";

  const client = await createClient(page, {
    fromStation,
    toStation,
    date: departureDate,
  });

  const result = await client.searchJourney({
    origin: "740000003",
    destination: "740000050",
    departureDate,
  });

  const summary = {
    fromStation,
    toStation,
    departureDate,
    departureSearchId: result.search.departureSearchId,
    passengerListId: result.search.passengerListId,
    numberOfDepartures: result.departures.length,
    numberOfOffers: Object.keys(result.offers).length,
    departures: result.departures.map((departure) => {
      const offerResult = result.offers[departure.departureId];

      return {
        departureId: departure.departureId,
        departure: departure.departureDateTime,
        arrival: departure.arrivalDateTime,
        duration: departure.duration,
        operators: formatLegs(departure),
        offerStatus: offerResult?.status || null,
        hasOffer: Boolean(offerResult?.offer),
      };
    }),
  };

  fs.writeFileSync("sj-client-demo-result.json", JSON.stringify(summary, null, 2));

  console.log("================================");
  console.log("SJ Client Demo");
  console.log("================================");
  console.log(`${fromStation} → ${toStation}`);
  console.log(`Date: ${departureDate}`);
  console.log(`Departures: ${summary.numberOfDepartures}`);
  console.log(`Offers: ${summary.numberOfOffers}`);
  console.log("");

  for (const departure of summary.departures) {
    console.log(
      `${departure.departure?.slice(11, 16)} → ${departure.arrival?.slice(
        11,
        16
      )} | ${departure.operators} | offer ${departure.offerStatus}`
    );
  }

  console.log("");
  console.log("Saved sj-client-demo-result.json");

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
