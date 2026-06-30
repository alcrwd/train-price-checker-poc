const { getTripsWithPrices } = require("./journeyService");

async function createDataset(search) {
  const journeys = await getTripsWithPrices({
    fromStation: search.origin,
    toStation: search.destination,
    date: search.travelDate,
  });

  return {
    generatedAt: new Date().toISOString(),
    search,
    journeys,
  };
}

module.exports = {
  createDataset,
};
