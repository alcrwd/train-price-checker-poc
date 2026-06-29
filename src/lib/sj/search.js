const API_BASE_URL =
  "https://prod-api.adp.sj.se/public/sales/booking/v3";

async function search(page, { apiHeaders, origin, destination, date }) {
  const body = {
    origin,
    destination,
    departureDate: date,
    passengers: [
      {
        passengerCategory: {
          type: "ADULT",
        },
      },
    ],
  };

  const result = await page.evaluate(
    async ({ apiBaseUrl, headers, body }) => {
      const response = await fetch(`${apiBaseUrl}/search`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    {
      apiBaseUrl: API_BASE_URL,
      headers: apiHeaders,
      body,
    }
  );

  if (result.status < 200 || result.status >= 300) {
    throw new Error(
      `SJ search failed with status ${result.status}: ${JSON.stringify(
        result.body
      )}`
    );
  }

  return {
    request: body,
    response: result.body,
    departureSearchId: result.body.departureSearchId,
    passengerListId: result.body.passengerListId,
    passengerListExpires: result.body.passengerListExpires,
  };
}

module.exports = {
  search,
};
