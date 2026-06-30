const fs = require("fs");
const path = require("path");

const ROUTES_FILE = path.join(
  process.cwd(),
  "config",
  "routes.json"
);

function getRoutes() {
  const config = JSON.parse(
    fs.readFileSync(ROUTES_FILE, "utf8")
  );

  return config.routes || [];
}

module.exports = {
  getRoutes,
};
