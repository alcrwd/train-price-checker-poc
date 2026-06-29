const { captureApiHeaders } = require("./headers");
const { search } = require("./search");
const { getDepartures } = require("./departures");
const { getOffers } = require("./offers");

async function createClient(page, options) {
  const apiHeaders = await captureApiHeaders(page, options);

  return {
    apiHeaders,

    async searchJourney({
      origin,
      destination,
      departureDate,
    }) {
      const searchResult = await search(page, {
        apiHeaders,
        origin,
        destination,
        date: departureDate,
      });

      const departuresResult = await getDepartures(page, {
        apiHeaders,
        departureSearchId: searchResult.departureSearchId,
      });

      const offersResult = await getOffers(page, {
        apiHeaders,
        departures: departuresResult.departures,
        passengerListId: searchResult.passengerListId,
      });

      return {
        search: searchResult,
        departures: departuresResult.departures,
        offers: offersResult,
      };
    },

    async searchOnly({
      origin,
      destination,
      departureDate,
    }) {
      return search(page, {
        apiHeaders,
        origin,
        destination,
        date: departureDate,
      });
    },

    async getDepartures(departureSearchId) {
      return getDepartures(page, {
        apiHeaders,
        departureSearchId,
      });
    },

    async getOffers(departures, passengerListId) {
      return getOffers(page, {
        apiHeaders,
        departures,
        passengerListId,
      });
    },
  };
}

module.exports = {
  createClient,
};
