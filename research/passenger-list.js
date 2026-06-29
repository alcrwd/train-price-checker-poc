const { chromium } = require("playwright");
const fs = require("fs");

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

(async () => {
  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const findings = {
    searchRequests: [],
    searchResponses: [],
    departuresSearchResponses: [],
    offerRequests: [],
    passengerListIds: [],
    localStorage: {},
    sessionStorage: {},
    cookies: [],
  };

  page.on("request", (request) => {
    const url = request.url();

    if (url.includes("/public/sales/booking/v3/search")) {
      findings.searchRequests.push({
        method: request.method(),
        url,
        postData: request.postData(),
      });

      console.log("================================");
      console.log("SEARCH REQUEST");
      console.log(request.method());
      console.log(url);
      console.log(request.postData());
    }

    if (
      url.includes("/departures/") &&
      url.includes("/offers")
    ) {
      const passengerListIdMatch = url.match(/passengerListId=([^&]+)/);

      findings.offerRequests.push({
        method: request.method(),
        url,
        passengerListId: passengerListIdMatch
          ? decodeURIComponent(passengerListIdMatch[1])
          : null,
      });

      if (passengerListIdMatch) {
        findings.passengerListIds.push({
          source: "offer-request-url",
          passengerListId: decodeURIComponent(passengerListIdMatch[1]),
          url,
        });
      }

      console.log("================================");
      console.log("OFFER REQUEST");
      console.log(request.method());
      console.log(url);
    }
  });

  page.on("response", async (response) => {
    const url = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!contentType.includes("application/json")) {
      return;
    }

    try {
      const json = await response.json();
      const text = JSON.stringify(json);

      if (url.includes("/public/sales/booking/v3/search")) {
        findings.searchResponses.push({
          status: response.status(),
          url,
          body: json,
        });

        console.log("================================");
        console.log("SEARCH RESPONSE");
        console.log(response.status());
        console.log(url);

        if (text.includes("passengerListId")) {
          findings.passengerListIds.push({
            source: "search-response-body",
            url,
            passengerListId: "FOUND_IN_BODY",
          });
        }
      }

      if (url.includes("/public/sales/booking/v3/departures/search/")) {
        findings.departuresSearchResponses.push({
          status: response.status(),
          url,
          body: json,
        });

        console.log("================================");
        console.log("DEPARTURES SEARCH RESPONSE");
        console.log(response.status());
        console.log(url);
        console.log(
          `Departures: ${(json.travels || []).reduce(
            (sum, travel) => sum + (travel.departures?.length || 0),
            0
          )}`
        );

        if (text.includes("passengerListId")) {
          findings.passengerListIds.push({
            source: "departures-search-response-body",
            url,
            passengerListId: "FOUND_IN_BODY",
          });
        }
      }
    } catch (error) {
      console.error("Could not parse JSON response:", error);
    }
  });

  const url = buildSjUrl(
    "Malmö Central",
    "Nyköping Central",
    "2026-07-15"
  );

  console.log(`Opening ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(20000);

  findings.cookies = await page.context().cookies();

  findings.localStorage = await page.evaluate(() => {
    const result = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      result[key] = localStorage.getItem(key);
    }

    return result;
  });

  findings.sessionStorage = await page.evaluate(() => {
    const result = {};

    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      result[key] = sessionStorage.getItem(key);
    }

    return result;
  });

  fs.writeFileSync(
    "research-output.json",
    JSON.stringify(findings, null, 2)
  );

  console.log("================================");
  console.log("Research complete");
  console.log(`Search requests: ${findings.searchRequests.length}`);
  console.log(`Search responses: ${findings.searchResponses.length}`);
  console.log(
    `Departures search responses: ${findings.departuresSearchResponses.length}`
  );
  console.log(`Offer requests: ${findings.offerRequests.length}`);
  console.log(`PassengerListIds found: ${findings.passengerListIds.length}`);
  console.log("Saved research-output.json");

  await browser.close();
