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

  const recentRequests = [];
  const recentResponses = [];

  return new Promise(async (resolve, reject) => {
    let settled = false;

    function addLimited(list, value, limit = 40) {
      list.push(value);

      if (list.length > limit) {
        list.shift();
      }
    }

    function isRelevantUrl(url) {
      return (
        url.includes("sj.se") ||
        url.includes("/sales/") ||
        url.includes("/booking/") ||
        url.includes("/search")
      );
    }

    function cleanup() {
      clearTimeout(timeoutId);

      page.off("request", handleRequest);
      page.off("response", handleResponse);
      page.off("requestfailed", handleRequestFailed);
      page.off("console", handleConsole);
      page.off("crash", handleCrash);
      page.off("pageerror", handlePageError);
    }

    function finish(error, value) {
      if (settled) return;

      settled = true;
      cleanup();

      if (error) {
        reject(error);
        return;
      }

      resolve(value);
    }

    function handleRequest(request) {
      const method = request.method();
      const url = request.url();
      const resourceType = request.resourceType();

      if (isRelevantUrl(url)) {
        addLimited(recentRequests, {
          method,
          url,
          resourceType,
        });

        console.log(`[SJ request] ${method} ${resourceType} ${url}`);
      }

      if (
        method === "POST" &&
        url.includes("/public/sales/booking/v3/search")
      ) {
        console.log(
          "[SJ diagnostic] Expected booking search request found"
        );

        finish(null, pickApiHeaders(request.headers()));
      }
    }

    function handleResponse(response) {
      const url = response.url();

      if (!isRelevantUrl(url)) return;

      const status = response.status();

      addLimited(recentResponses, {
        status,
        url,
      });

      console.log(`[SJ response] ${status} ${url}`);
    }

    function handleRequestFailed(request) {
      const url = request.url();

      if (!isRelevantUrl(url)) return;

      console.warn("[SJ request failed]", {
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });
    }

    function handleConsole(message) {
      if (!["error", "warning"].includes(message.type())) return;

      console.warn(
        `[SJ browser console ${message.type()}]`,
        message.text()
      );
    }

    function handleCrash() {
      finish(
        new Error("SJ page crashed while capturing API headers")
      );
    }

    function handlePageError(error) {
      console.warn("SJ page error:", error.message);
    }

    page.on("request", handleRequest);
    page.on("response", handleResponse);
    page.on("requestfailed", handleRequestFailed);
    page.on("console", handleConsole);
    page.on("crash", handleCrash);
    page.on("pageerror", handlePageError);

    timeoutId = setTimeout(async () => {
      try {
        const diagnostic = await page.evaluate(() => {
          const visibleText = document.body?.innerText || "";

          return {
            url: window.location.href,
            title: document.title,
            readyState: document.readyState,
            visibleText: visibleText.slice(0, 2000),
          };
        });

        const combinedText =
          `${diagnostic.title}\n${diagnostic.visibleText}`.toLowerCase();

        const blockTerms = [
          "captcha",
          "access denied",
          "forbidden",
          "blocked",
          "unusual traffic",
          "verify",
          "robot",
          "403",
          "429",
        ];

        const possibleBlockTerms = blockTerms.filter((term) =>
          combinedText.includes(term)
        );

        console.error(
  `[SJ timeout diagnostic] ${JSON.stringify({
    ...diagnostic,
    possibleBlockTerms,
    recentRequests,
    recentResponses,
  })}`
);

        try {
          await page.screenshot({
            path: "/tmp/sj-timeout-diagnostic.png",
            fullPage: true,
          });

          console.log(
            "[SJ diagnostic] Screenshot saved to /tmp/sj-timeout-diagnostic.png"
          );
        } catch (screenshotError) {
          console.warn(
            "[SJ diagnostic] Could not save screenshot:",
            screenshotError.message
          );
        }
      } catch (diagnosticError) {
        console.error(
          "[SJ diagnostic] Could not inspect page:",
          diagnosticError.message
        );
      }

      finish(
        new Error("Timed out waiting for POST /search request")
      );
    }, 30000);

    try {
      const targetUrl = buildSjUrl(
        fromStation,
        toStation,
        date
      );

      console.log(
        "[SJ diagnostic] Navigating to:",
        targetUrl
      );

      const response = await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      console.log("[SJ diagnostic] Main document loaded", {
        status: response?.status(),
        finalUrl: page.url(),
        title: await page.title(),
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
