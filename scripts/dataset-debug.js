const { createDataset } = require("../src/services/datasetService");

function printDatasetSummary(name, dataset) {
  const cheapest = [...dataset.journeys]
    .filter((journey) => typeof journey.price === "number")
    .sort((a, b) => a.price - b.price)[0];

  console.log("");
  console.log("================================");
  console.log(name);
  console.log("================================");
  console.log(`Search: ${dataset.search.origin} → ${dataset.search.destination}`);
  console.log(`Journeys: ${dataset.journeys.length}`);

  if (!cheapest) {
    console.log("Cheapest journey: none");
    return;
  }

  console.log("");
  console.log("Cheapest journey:");
  console.log(`Price: ${cheapest.price} ${cheapest.currency}`);
  console.log(`Time: ${cheapest.departureTime} → ${cheapest.arrivalTime}`);
  console.log(`ID: ${cheapest.id}`);

  console.log("");
  console.log("Legs:");

  for (const leg of cheapest.legs) {
    console.log(
      `- ${leg.operator} ${leg.trainNumber}: ${leg.origin} ${leg.departureTime} → ${leg.destination} ${leg.arrivalTime}`
    );
  }
}

async function main() {
  const travelDate = "2026-07-15";

  const datasets = [
    {
      name: "Standard: Malmö → Nyköping",
      search: {
        origin: "Malmö Central",
        destination: "Nyköping Central",
        travelDate,
      },
    },
    {
      name: "Stockholm: Malmö → Stockholm",
      search: {
        origin: "Malmö Central",
        destination: "Stockholm Central",
        travelDate,
      },
    },
    {
      name: "Transfer: Norrköping → Nyköping",
      search: {
        origin: "Norrköping Central",
        destination: "Nyköping Central",
        travelDate,
      },
    },
  ];

  for (const item of datasets) {
    const dataset = await createDataset(item.search);
    printDatasetSummary(item.name, dataset);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
