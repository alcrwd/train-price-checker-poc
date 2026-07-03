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
  let timeoutId;

  return new Promise(async (resolve, reject) => {
    let settled = false;

    function finish(error, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);

      if (error) {
        reject(error);
        return;
      }

      resolve(value);
    }

    timeoutId = setTimeout(() => {
      finish(new Error("Timed out waiting for POST /search request"));
    }, 30000);

    page.on("request", (request) => {
      const url = request.url();

      if (
        request.method() === "POST" &&
        url.includes("/public/sales/booking/v3/search")
      ) {
        finish(null, pickApiHeaders(request.headers()));
      }
    });

    page.on("crash", () => {
      finish(new Error("SJ page crashed while capturing API headers"));
    });

    page.on("pageerror", (error) => {
      console.warn("SJ page error:", error.message);
    });

    try {
      await page.goto(buildSjUrl(fromStation, toStation, date), {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (error) {
      finish(error);
    }
  });
}

module.exports = {
  buildSjUrl,
  captureApiHeaders,
  pickApiHeaders,
};
