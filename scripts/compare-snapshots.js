const fs = require("fs");
const { compareSnapshots } = require("../src/services/priceComparisonService");

function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function main() {
  const previousPath = process.argv[2] || "previous-price-snapshot.json";
  const currentPath = process.argv[3] || "current-price-snapshot.json";

  console.log("Comparing snapshots");
  console.log(`Previous: ${previousPath}`);
  console.log(`Current: ${currentPath}`);

  const previousSnapshot = readJsonFile(previousPath);
  const currentSnapshot = readJsonFile(currentPath);

  const comparison = compareSnapshots(previousSnapshot, currentSnapshot);

  fs.writeFileSync(
    "price-comparison-result.json",
    JSON.stringify(comparison, null, 2)
  );

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
  console.log("");
  console.log("Saved price-comparison-result.json");
}

main();
