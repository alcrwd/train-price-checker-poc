const { fetchDeparturesWithOffers } = require("../src/api/sjApi");
const { mapDeparturesToTrips } = require("../src/api/tripMapper");
const { attachOffersToTrips } = require("../src/services/offerService");
const {
  createPriceSnapshot,
} = require("../src/services/priceSnapshotService");
const {
  saveSnapshot,
  getLatestSnapshot,
} = require("../src/services/snapshotStorageService");
const {
  compareSnapshots,
} = require("../src/services/priceComparisonService");

function printComparison(comparison) {
  console.log("");
  console.log("================================");
  console.log("Price Comparison");
  console.log("================================");
  console.log(`Previous lowest: ${comparison.previousLowestPrice ?? "-"}`);
  console.log(`Current lowest: ${comparison.currentLowestPrice ?? "-"}`);
  console.log(`Lowest difference: ${comparison.lowestPriceDifference ?? "-"}`);
  console.log("");
  console.log(`Added trips: ${comparison.summary.addedTrips}`);
  console.log(`Removed trips: ${comparison.summary.removedTrips}`);
  console.log(`Cheaper trips: ${comparison.summary.cheaperTrips}`);
  console.log(`More expensive trips: ${comparison.summary.moreExpensiveTrips}`);
  console.log(`Unchanged trips: ${comparison.summary.unchangedTrips}`);

  if (comparison.cheaperTrips.length > 0) {
    console.log("");
    console.log("Cheaper trips:");

    for (const trip of comparison.cheaperTrips) {
      console.log(
        `${trip.departure} → ${trip.arrival}: ${trip.previousPrice} → ${trip.currentPrice} kr (${trip.difference} kr)`
      );
    }
  }
}

async function main() {
  const fromStation = "Malmö Central";
  const toStation = "Nyköping Central";
  const date = process.argv[2] || "2026-07-15";

  const previousSnapshot = getLatestSnapshot();

  console.log(`Scanning ${fromStation} → ${toStation} (${date})`);

  const { departures, offersByDepartureId } = await fetchDeparturesWithOffers({
    fromStation,
    toStation,
    date,
  });

  const trips = mapDeparturesToTrips(departures);
  const tripsWithPrices = attachOffersToTrips(trips, offersByDepartureId);

  const currentSnapshot = createPriceSnapshot({
    fromStation,
    toStation,
    date,
    trips: tripsWithPrices,
  });

  const savedPath = saveSnapshot(currentSnapshot);

  console.log("================================");
  console.log("Price Snapshot");
  console.log("================================");
  console.log(`Trips: ${currentSnapshot.numberOfTrips}`);
  console.log(`Priced trips: ${currentSnapshot.numberOfPricedTrips}`);
  console.log(`Lowest price: ${currentSnapshot.lowestPrice ?? "-"}`);
  console.log(`Saved: ${savedPath}`);

  if (!previousSnapshot) {
    console.log("");
    console.log("No previous snapshot found. Skipping comparison.");
    return;
  }

  const comparison = compareSnapshots(previousSnapshot, currentSnapshot);
  printComparison(comparison);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
