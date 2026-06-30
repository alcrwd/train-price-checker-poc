const fs = require("fs");
const path = require("path");

const { createDataset } = require("../src/services/datasetService");

async function main() {
  const search = {
    origin: "Malmö Central",
    destination: "Nyköping Central",
    travelDate: "2026-07-15",
  };

  console.log("Creating dataset...");
  console.log("");

  const dataset = await createDataset(search);

  console.log(`Journeys found: ${dataset.journeys.length}`);
  console.log("");

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "dataset-demo-result.json"
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(dataset, null, 2),
    "utf8"
  );

  console.log(`Dataset written to: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
