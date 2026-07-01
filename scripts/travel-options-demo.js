const fs = require("fs");
const path = require("path");

const { createDataset } = require("../src/services/datasetService");
const {
  createTravelOptions,
} = require("../src/services/travelOptionService");

async function main() {
  const travelDate = "2026-07-15";

  console.log("Creating datasets...");
  console.log("");

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

  const norrkopingDataset = await createDataset({
    origin: "Norrköping Central",
    destination: "Nyköping Central",
    travelDate,
  });

  const travelOptions = createTravelOptions({
    standardDataset,
    stockholmDataset,
    norrkopingDataset,
  });

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "travel-options-demo-result.json"
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(travelOptions, null, 2),
    "utf8"
  );

  console.log(`Options found: ${travelOptions.options.length}`);
  console.log(`Result written to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
