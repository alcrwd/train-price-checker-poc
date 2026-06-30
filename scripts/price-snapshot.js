const fs = require("fs");
const { fetchDeparturesWithOffers } = require("../src/api/sjApi");
const { mapDeparturesToTrips } = require("../src/api/tripMapper");
const { attachOffersToTrips } = require("../src/services/offerService");
const {
  createPriceSnapshot,
} = require("../src/services/priceSnapshotService");

async function main() {
  const fromStation = "Malmö Central";
  const toStation = "Nyköping Central";
  const date = process.argv[2] || "2026-07-15";

  console.log(`Scanning ${fromStation} → ${toStation} (${date})`);

  const { departures, offersByDepartureId } =
    await fetchDeparturesWithOffers({
      fromStation,
      toStation,
      date,
    });

  const trips = mapDeparturesToTrips(departures);

  const tripsWithPrices = attachOffersToTrips(
    trips,
    offersByDepartureId
  );

  const snapshot = createPriceSnapshot({
    fromStation,
    toStation,
    date,
    trips: tripsWithPrices,
  });

  fs.writeFileSync(
    "price-snapshot.json",
    JSON.stringify(snapshot, null, 2)
  );

  console.log("================================");
  console.log("Price Snapshot");
  console.log("================================");
  console.log(`Trips: ${snapshot.numberOfTrips}`);
  console.log(`Priced trips: ${snapshot.numberOfPricedTrips}`);
  console.log(`Lowest price: ${snapshot.lowestPrice ?? "-"}`);
  console.log("Saved price-snapshot.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
