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
    requests: [],
    responses: [],
    cookiesBefore: [],
    cookiesAfter: [],
    localStorage: {},
    sessionStorage: {},
    passengerListIds: [],
  };

  findings.cookiesBefore = await page.context().cookies();

  page.on("request", (request) => {
    const url = request.url();

    findings.requests.push({
      method: request.method(),
      url,
      postData: request.postData(),
    });

    if (url.includes("passengerList")) {
      console.log("REQUEST CONTAINS passengerList:");
      console.log(url);
    }
  });

  page.on("response", async (response) => {
    const url = response.url();

    findings.responses.push({
      status: response.status(),
      url,
    });

    try {
      const contentType = response.headers()["content-type"] || "";

      if (!contentType.includes("application/json")) {
        return;
      }

      const json = await response.json();
      const text = JSON.stringify(json);

      if (text.includes("passengerListId")) {
        console.log("FOUND passengerListId IN RESPONSE:");
        console.log(url);

        findings.passengerListIds.push({
          url,
          status: response.status(),
          body: json,
        });
      }
    } catch {
      // Ignore responses that cannot be parsed.
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

  findings.cookiesAfter = await page.context().cookies();

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
  console.log(`Requests: ${findings.requests.length}`);
  console.log(`Responses: ${findings.responses.length}`);
  console.log(`PassengerListIds found: ${findings.passengerListIds.length}`);
  console.log("Saved research-output.json");

  await browser.close();
})();
