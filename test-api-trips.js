const fs = require("fs");
const { fetchDepartures } = require("./src/api/sjApi");
const { mapDeparturesToTrips } = require("./src/api/tripMapper");

async function main() {
  const date = process.argv[2] || "2026-07-15";

  const departures = await fetchDepartures({
    fromStation: "Malmö Central",
    toStation: "Nyköping Central",
    date,
  });

  const trips = mapDeparturesToTrips(departures);

  const output = {
    date,
    fromStation: "Malmö Central",
    toStation: "Nyköping Central",
    numberOfDepartures: departures.length,
    numberOfTrips: trips.length,
    routeTypes: {
      viaNorrkoping: trips.filter((trip) => trip.routeType === "via-norrkoping")
        .length,
      viaStockholm: trips.filter((trip) => trip.routeType === "via-stockholm")
        .length,
      other: trips.filter((trip) => trip.routeType === "other").length,
    },
    trips,
  };

  fs.writeFileSync("api-trips-result.json", JSON.stringify(output, null, 2));

  console.log("=================================");
  console.log("API Trips Test");
  console.log("=================================");
  console.log(`Datum: ${date}`);
  console.log(`Antal trips: ${trips.length}`);
  console.log(output.routeTypes);
  console.log("Resultat sparat till api-trips-result.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
