const fs = require("fs");
const path = require("path");

const SNAPSHOT_BASE_DIRECTORY = path.join(
  process.cwd(),
  "data",
  "snapshots"
);

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, {
    recursive: true,
  });
}

function getRouteSnapshotDirectory(routeId) {
  if (!routeId) {
    throw new Error("routeId is required");
  }

  return path.join(SNAPSHOT_BASE_DIRECTORY, routeId);
}

function createSnapshotFilename(scannedAt) {
  return `${scannedAt.replace(/[:.]/g, "-")}.json`;
}

function saveSnapshot(routeId, snapshot) {
  const directory = getRouteSnapshotDirectory(routeId);

  ensureDirectory(directory);

  const filename = createSnapshotFilename(snapshot.scannedAt);
  const filePath = path.join(directory, filename);

  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));

  return filePath;
}

function listSnapshots(routeId) {
  const directory = getRouteSnapshotDirectory(routeId);

  ensureDirectory(directory);

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function getLatestSnapshotPath(routeId) {
  const snapshots = listSnapshots(routeId);

  if (snapshots.length === 0) {
    return null;
  }

  const directory = getRouteSnapshotDirectory(routeId);

  return path.join(directory, snapshots[snapshots.length - 1]);
}

function loadSnapshot(filePath) {
  if (!filePath) return null;

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getLatestSnapshot(routeId) {
  return loadSnapshot(getLatestSnapshotPath(routeId));
}

module.exports = {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  getLatestSnapshotPath,
  getLatestSnapshot,
};
