const API_BASE_URL =
  "https://prod-api.adp.sj.se/public/sales/booking/v3";

async function getOffer(page, { apiHeaders, departureId, passengerListId }) {
  const result = await page.evaluate(
    async ({ apiBaseUrl, headers, departureId, passengerListId }) => {
      const response = await fetch(
        `${apiBaseUrl}/departures/${departureId}/offers?passengerListId=${encodeURIComponent(
          passengerListId
        )}`,
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
      departureId,
      passengerListId,
    }
  );

  if (result.status < 200 || result.status >= 300) {
    return {
      departureId,
      status: result.status,
      error: result.body,
      offer: null,
    };
  }

  return {
    departureId,
    status: result.status,
    error: null,
    offer: result.body,
  };
}

async function getOffers(page, { apiHeaders, departures, passengerListId }) {
  const offersByDepartureId = {};

  for (const departure of departures) {
    const departureId = departure.departureId;

    const result = await getOffer(page, {
      apiHeaders,
      departureId,
      passengerListId,
    });

    offersByDepartureId[departureId] = result;

    console.log(
      `Offer ${departure.departureDateTime?.slice(11, 16)} ${departureId}: ${
        result.status
      }`
    );
  }

  return offersByDepartureId;
}

module.exports = {
  getOffer,
  getOffers,
};
