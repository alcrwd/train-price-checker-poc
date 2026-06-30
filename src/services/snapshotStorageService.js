const fs = require("fs");
const path = require("path");

const SNAPSHOT_DIRECTORY = path.join(
  process.cwd(),
  "data",
  "snapshots"
);

function ensureSnapshotDirectory() {
  fs.mkdirSync(SNAPSHOT_DIRECTORY, {
    recursive: true,
  });
}

function createSnapshotFilename(scannedAt) {
  return `${scannedAt.replace(/[:.]/g, "-")}.json`;
}

function saveSnapshot(snapshot) {
  ensureSnapshotDirectory();

  const filename = createSnapshotFilename(snapshot.scannedAt);
  const filePath = path.join(SNAPSHOT_DIRECTORY, filename);

  fs.writeFileSync(
    filePath,
    JSON.stringify(snapshot, null, 2)
  );

  return filePath;
}

function listSnapshots() {
  ensureSnapshotDirectory();

  return fs
    .readdirSync(SNAPSHOT_DIRECTORY)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function getLatestSnapshotPath() {
  const snapshots = listSnapshots();

  if (snapshots.length === 0) {
    return null;
  }

  return path.join(SNAPSHOT_DIRECTORY, snapshots[snapshots.length - 1]);
}

function getPreviousSnapshotPath() {
  const snapshots = listSnapshots();

  if (snapshots.length < 2) {
    return null;
  }

  return path.join(SNAPSHOT_DIRECTORY, snapshots[snapshots.length - 2]);
}

function loadSnapshot(filePath) {
  if (!filePath) return null;

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getLatestSnapshot() {
  return loadSnapshot(getLatestSnapshotPath());
}

function getPreviousSnapshot() {
  return loadSnapshot(getPreviousSnapshotPath());
}

module.exports = {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  getLatestSnapshotPath,
  getPreviousSnapshotPath,
  getLatestSnapshot,
  getPreviousSnapshot,
};
