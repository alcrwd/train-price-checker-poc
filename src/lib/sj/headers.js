function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

function pickApiHeaders(headers) {
  return {
    "content-type": "application/json",
    "accept-language": headers["accept-language"] || "sv-SE",
    "ocp-apim-subscription-key": headers["ocp-apim-subscription-key"],
    "x-client-name": headers["x-client-name"],
    "x-client-version": headers["x-client-version"],
    "ocp-apim-trace": headers["ocp-apim-trace"] || "true",
  };
}

async function captureApiHeaders(page, { fromStation, toStation, date }) {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for POST /search request"));
    }, 30000);

    page.on("request", (request) => {
      const url = request.url();

      if (
        request.method() === "POST" &&
        url.includes("/public/sales/booking/v3/search")
      ) {
        clearTimeout(timeout);
        resolve(pickApiHeaders(request.headers()));
      }
    });

    await page.goto(buildSjUrl(fromStation, toStation, date), {
      waitUntil: "domcontentloaded",
    });
  });
}

module.exports = {
  buildSjUrl,
  captureApiHeaders,
  pickApiHeaders,
};
