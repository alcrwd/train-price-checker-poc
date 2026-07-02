const http = require("http");

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    sendJson(res, 200, {
      name: "Train Price Checker API",
      status: "running",
    });
    return;
  }

  sendJson(res, 404, {
    error: "Not found",
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
