const http = require("http");

const { createComparisonResult } = require("./services/comparisonService");

const PORT = process.env.PORT || 3000;
const DEFAULT_DIRECTION = "malmo-nykoping";

let comparisonCache = {};
let refreshPromises = {};

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

function getCacheKey({ direction, travelDate }) {
  return `${direction}:${travelDate}`;
}

function getDirection(url) {
  return url.searchParams.get("direction") || DEFAULT_DIRECTION;
}

function isUnsupportedDirectionError(error) {
  return error?.message?.startsWith("Unsupported direction:");
}

async function refreshComparison({ direction, travelDate }) {
  const cacheKey = getCacheKey({ direction, travelDate });

  if (refreshPromises[cacheKey]) {
    return refreshPromises[cacheKey];
  }

  refreshPromises[cacheKey] = createComparisonResult({
    direction,
    travelDate,
  })
    .then((result) => {
      comparisonCache[cacheKey] = {
        result,
        cachedAt: new Date().toISOString(),
        direction,
        travelDate,
      };

      return comparisonCache[cacheKey];
    })
    .finally(() => {
      delete refreshPromises[cacheKey];
    });

  return refreshPromises[cacheKey];
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
      cacheKeys: Object.keys(comparisonCache),
      refreshInProgressKeys: Object.keys(refreshPromises),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    sendJson(res, 200, {
      name: "Train Price Checker API",
      status: "running",
      cacheKeys: Object.keys(comparisonCache),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/comparison") {
    const direction = getDirection(url);
    const travelDate = url.searchParams.get("date") || getTodaySwedishDate();
    const cacheKey = getCacheKey({ direction, travelDate });

    try {
      if (comparisonCache[cacheKey]) {
        sendJson(res, 200, {
          ...comparisonCache[cacheKey].result,
          cache: {
            status: "hit",
            cachedAt: comparisonCache[cacheKey].cachedAt,
            refreshInProgress: Boolean(refreshPromises[cacheKey]),
          },
        });
        return;
      }

      const cache = await refreshComparison({ direction, travelDate });

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

      if (isUnsupportedDirectionError(error)) {
        sendJson(res, 400, {
          error: "invalid_direction",
          message: error.message,
        });
        return;
      }

      const fallbackCache = comparisonCache[cacheKey];

      if (fallbackCache) {
        sendJson(res, 200, {
          ...fallbackCache.result,
          cache: {
            status: "stale_after_error",
            cachedAt: fallbackCache.cachedAt,
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
    const direction = getDirection(url);
    const travelDate = url.searchParams.get("date") || getTodaySwedishDate();
    const cacheKey = getCacheKey({ direction, travelDate });

    try {
      const cache = await refreshComparison({ direction, travelDate });

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

      if (isUnsupportedDirectionError(error)) {
        sendJson(res, 400, {
          error: "invalid_direction",
          message: error.message,
        });
        return;
      }

      sendJson(res, 500, {
        error: "comparison_refresh_failed",
        message: error.message,
        cache: comparisonCache[cacheKey]
          ? {
              status: "stale_available",
              cachedAt: comparisonCache[cacheKey].cachedAt,
              travelDate: comparisonCache[cacheKey].travelDate,
              direction: comparisonCache[cacheKey].direction,
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
