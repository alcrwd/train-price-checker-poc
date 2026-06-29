const fs = require("fs");
const { fetchDeparturesWithOffers } = require("./src/api/sjApi");
const { mapDeparturesToTrips } = require("./src/api/tripMapper");
const { attachOffersToTrips } = require("./src/services/offerService");

async function main() {
  const date = process.argv[2] || "2026-07-15";

  const { departures, offersByDepartureId } = await fetchDeparturesWithOffers({
    fromStation: "Malmö Central",
    toStation: "Nyköping Central",
    date,
  });

  const trips = mapDeparturesToTrips(departures);
  const pricedTrips = attachOffersToTrips(trips, offersByDepartureId);

  const output = {
    date,
    fromStation: "Malmö Central",
    toStation: "Nyköping Central",
    numberOfDepartures: departures.length,
    numberOfOffers: Object.keys(offersByDepartureId).length,
    numberOfTrips: pricedTrips.length,
    numberOfPricedTrips: pricedTrips.filter((trip) => trip.hasPrice).length,
    routeTypes: {
      viaNorrkoping: pricedTrips.filter(
        (trip) => trip.routeType === "via-norrkoping"
      ).length,
      viaStockholm: pricedTrips.filter(
        (trip) => trip.routeType === "via-stockholm"
      ).length,
      other: pricedTrips.filter((trip) => trip.routeType === "other").length,
    },
    trips: pricedTrips,
  };

  fs.writeFileSync("api-trips-result.json", JSON.stringify(output, null, 2));

  console.log("=================================");
  console.log("API Trips Test");
  console.log("=================================");
  console.log(`Datum: ${date}`);
  console.log(`Antal trips: ${pricedTrips.length}`);
  console.log(`Antal offers: ${Object.keys(offersByDepartureId).length}`);
  console.log(`Antal trips med pris: ${output.numberOfPricedTrips}`);
  console.log(output.routeTypes);
  console.log("Resultat sparat till api-trips-result.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
