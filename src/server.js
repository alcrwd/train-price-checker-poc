const http = require("http");

const { createComparisonResult } = require("./services/comparisonService");

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
});

  res.end(JSON.stringify(data, null, 2));
}

function getTodaySwedishDate() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    sendJson(res, 200, {
      name: "Train Price Checker API",
      status: "running",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/comparison") {
    try {
      const travelDate = url.searchParams.get("date") || getTodaySwedishDate();

      const result = await createComparisonResult({
        travelDate,
      });

      sendJson(res, 200, result);
    } catch (error) {
      console.error(error);

      sendJson(res, 500, {
        error: "comparison_failed",
        message: error.message,
      });
    }

    return;
  }

  sendJson(res, 404, {
    error: "Not found",
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
