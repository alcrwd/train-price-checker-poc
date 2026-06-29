const { chromium } = require("playwright");

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

async function fetchDepartures({ fromStation, toStation, date }) {
  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const departuresSearchResponses = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!responseUrl.includes("/departures/search/")) return;
    if (!contentType.includes("application/json")) return;

    try {
      const json = await response.json();
      departuresSearchResponses.push(json);
    } catch (error) {
      console.error("Could not parse departures/search JSON:", error);
    }
  });

  const url = buildSjUrl(fromStation, toStation, date);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(15000);

  await browser.close();

  const departures = [];

  for (const json of departuresSearchResponses) {
    for (const travel of json.travels || []) {
      for (const departure of travel.departures || []) {
        departures.push(departure);
      }
    }
  }

  return departures;
}

module.exports = {
  fetchDepartures,
};
