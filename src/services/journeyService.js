const { fetchDeparturesWithOffers } = require("../api/sjApi");
const { mapDeparturesToTrips } = require("../api/tripMapper");
const { attachOffersToTrips } = require("./offerService");

async function getTripsWithPrices({ fromStation, toStation, date }) {
  const { departures, offersByDepartureId } = await fetchDeparturesWithOffers({
    fromStation,
    toStation,
    date,
  });

  const trips = mapDeparturesToTrips(departures);

  return attachOffersToTrips(trips, offersByDepartureId);
}

module.exports = {
  getTripsWithPrices,
};
