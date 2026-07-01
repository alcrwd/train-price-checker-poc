const { createDataset } = require("../src/services/datasetService");
const {
  createTravelOptions,
} = require("../src/services/travelOptionService");

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getOptionByType(options, type) {
  return options.find((option) => option.type === type) || null;
}

function formatPrice(option) {
  return option ? option.totalPrice : "N/A";
}

function formatDifference(standardOption, stockholmOption) {
  if (!standardOption || !stockholmOption) {
    return "N/A";
  }

  const difference = stockholmOption.totalPrice - standardOption.totalPrice;

  if (difference > 0) {
    return `+${difference}`;
  }

  return String(difference);
}

async function createOptionsForDate(travelDate) {
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

  return createTravelOptions({
    standardDataset,
    stockholmDataset,
    norrkopingDataset,
  });
}

async function main() {
  const startDate = new Date().toISOString().slice(0, 10);
  const numberOfDays = 30;

  console.log("Date | Standard | Stockholm + transfer | Difference");
  console.log("---- | -------- | -------------------- | ----------");

  for (let i = 0; i < numberOfDays; i++) {
    const travelDate = addDays(startDate, i);

    const travelOptions = await createOptionsForDate(travelDate);

    const standardOption = getOptionByType(
      travelOptions.options,
      "standard-ticket"
    );

    const stockholmOption = getOptionByType(
      travelOptions.options,
      "stockholm-ticket-plus-transfer"
    );

    console.log(
      `${travelDate} | ${formatPrice(standardOption)} | ${formatPrice(
        stockholmOption
      )} | ${formatDifference(standardOption, stockholmOption)}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
