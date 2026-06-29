const API_BASE_URL =
  "https://prod-api.adp.sj.se/public/sales/booking/v3";

async function getDepartures(page, { apiHeaders, departureSearchId }) {
  const result = await page.evaluate(
    async ({ apiBaseUrl, headers, departureSearchId }) => {
      const response = await fetch(
        `${apiBaseUrl}/departures/search/${departureSearchId}`,
        {
          method: "GET",
          headers,
        }
      );

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    {
      apiBaseUrl: API_BASE_URL,
      headers: apiHeaders,
      departureSearchId,
    }
  );

  if (result.status < 200 || result.status >= 300) {
    throw new Error(
      `SJ departures search failed with status ${result.status}: ${JSON.stringify(
        result.body
      )}`
    );
  }

  const departures = [];

  for (const travel of result.body.travels || []) {
    for (const departure of travel.departures || []) {
      departures.push(departure);
    }
  }

  return {
    response: result.body,
    departures,
  };
}

module.exports = {
  getDepartures,
};
