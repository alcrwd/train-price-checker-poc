const { getRoutes } = require("../src/config/routes");
const { getTripsWithPrices } = require("../src/services/journeyService");
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
const {
  createAlert,
} = require("../src/services/alertService");

function printComparison(comparison) {
  console.log("");
  console.log("================================");
  console.log("Price Comparison");
  console.log("================================");

  console.log(
    `Previous lowest: ${comparison.previousLowestPrice ?? "-"}`
  );
  console.log(
    `Current lowest: ${comparison.currentLowestPrice ?? "-"}`
  );
  console.log(
    `Lowest difference: ${comparison.lowestPriceDifference ?? "-"}`
  );

  console.log("");

  console.log(`Added trips: ${comparison.summary.addedTrips}`);
  console.log(`Removed trips: ${comparison.summary.removedTrips}`);
  console.log(`Cheaper trips: ${comparison.summary.cheaperTrips}`);
  console.log(
    `More expensive trips: ${comparison.summary.moreExpensiveTrips}`
  );
  console.log(
    `Unchanged trips: ${comparison.summary.unchangedTrips}`
  );
}

function printAlert(alert) {
  console.log("");
  console.log("================================");
  console.log("Alert");
  console.log("================================");

  if (!alert.hasAlert) {
    console.log("No alert.");
    return;
  }

  console.log(`ALERT: ${alert.title}`);
  console.log(
    `${alert.previousPrice} → ${alert.currentPrice} kr`
  );
  console.log(`Difference: ${alert.difference} kr`);
}

async function processRoute(route) {
  console.log("");
  console.log("############################################");
  console.log(route.name);
  console.log("############################################");

  const previousSnapshot = getLatestSnapshot();

  const trips = await getTripsWithPrices({
    fromStation: route.from.name,
    toStation: route.to.name,
    date: route.travel.date,
  });

  const snapshot = createPriceSnapshot({
    fromStation: route.from.name,
    toStation: route.to.name,
    date: route.travel.date,
    trips,
  });

  const savedPath = saveSnapshot(snapshot);

  console.log("");
  console.log("================================");
  console.log("Price Snapshot");
  console.log("================================");
  console.log(`Trips: ${snapshot.numberOfTrips}`);
  console.log(
    `Priced trips: ${snapshot.numberOfPricedTrips}`
  );
  console.log(
    `Lowest price: ${snapshot.lowestPrice ?? "-"}`
  );
  console.log(`Saved: ${savedPath}`);

  if (!previousSnapshot) {
    console.log("");
    console.log(
      "No previous snapshot found. Skipping comparison."
    );
    return;
  }

  const comparison = compareSnapshots(
    previousSnapshot,
    snapshot
  );

  printComparison(comparison);

  const alert = createAlert(comparison);

  printAlert(alert);
}

async function main() {
  const routes = getRoutes().filter(
    (route) => route.enabled
  );

  if (routes.length === 0) {
    console.log("No enabled routes.");
    return;
  }

  for (const route of routes) {
    await processRoute(route);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
