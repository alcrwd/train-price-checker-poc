const http = require("http");

const { createComparisonResult } = require("./services/comparisonService");

const PORT = process.env.PORT || 3000;

let comparisonCache = null;
let refreshPromise = null;

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

async function refreshComparison({ travelDate }) {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = createComparisonResult({ travelDate })
    .then((result) => {
      comparisonCache = {
        result,
        cachedAt: new Date().toISOString(),
        travelDate,
      };

      return comparisonCache;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
      hasComparisonCache: Boolean(comparisonCache),
      refreshInProgress: Boolean(refreshPromise),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    sendJson(res, 200, {
      name: "Train Price Checker API",
      status: "running",
      hasComparisonCache: Boolean(comparisonCache),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/comparison") {
    try {
      const travelDate = url.searchParams.get("date") || getTodaySwedishDate();

      if (
        comparisonCache &&
        comparisonCache.travelDate === travelDate
      ) {
        sendJson(res, 200, {
          ...comparisonCache.result,
          cache: {
            status: "hit",
            cachedAt: comparisonCache.cachedAt,
            refreshInProgress: Boolean(refreshPromise),
          },
        });
        return;
      }

      const cache = await refreshComparison({ travelDate });

      sendJson(res, 200, {
        ...cache.result,
        cache: {
          status: "miss",
          cachedAt: cache.cachedAt,
          refreshInProgress: false,
        },
      });
    } catch (error) {
      console.error(error);

      if (comparisonCache) {
        sendJson(res, 200, {
          ...comparisonCache.result,
          cache: {
            status: "stale_after_error",
            cachedAt: comparisonCache.cachedAt,
            refreshInProgress: false,
            error: error.message,
          },
        });
        return;
      }

      sendJson(res, 500, {
        error: "comparison_failed",
        message: error.message,
      });
    }

    return;
  }

  if (req.method === "GET" && url.pathname === "/api/comparison/refresh") {
    try {
      const travelDate = url.searchParams.get("date") || getTodaySwedishDate();
      const cache = await refreshComparison({ travelDate });

      sendJson(res, 200, {
        ...cache.result,
        cache: {
          status: "refreshed",
          cachedAt: cache.cachedAt,
          refreshInProgress: false,
        },
      });
    } catch (error) {
      console.error(error);

      sendJson(res, 500, {
        error: "comparison_refresh_failed",
        message: error.message,
        cache: comparisonCache
          ? {
              status: "stale_available",
              cachedAt: comparisonCache.cachedAt,
              travelDate: comparisonCache.travelDate,
            }
          : {
              status: "empty",
            },
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
