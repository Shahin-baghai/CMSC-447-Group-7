const fs = require("fs/promises");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");
const logFile = path.join(logDir, "employee-restocks.jsonl");

async function ensureLogDir() {
  await fs.mkdir(logDir, { recursive: true });
}

async function appendLog(entry) {
  await ensureLogDir();
  await fs.appendFile(logFile, `${JSON.stringify(entry)}\n`, "utf8");
}

function normalizeLegacyRestock(entry) {
  if (entry.summary && entry.actionType) {
    return entry;
  }

  if (entry.slotId && entry.quantityAdded !== undefined) {
    return {
      ...entry,
      actionType: "legacy_employee_restock",
      summary: `${entry.username} restocked slot ${entry.slotId}`,
      target: {
        type: "machine-slot",
        id: entry.slotId
      },
      details: {
        productId: entry.productId,
        quantityAdded: entry.quantityAdded
      }
    };
  }

  return entry;
}

exports.recordActivity = async ({
  actingUser,
  actionType,
  summary,
  target = null,
  details = {},
  timestamp = new Date().toISOString()
}) => {
  const entry = {
    username: actingUser?.username || "unknown",
    userId: actingUser?.userId || null,
    role: actingUser?.role || "unknown",
    actionType,
    summary,
    target,
    details,
    timestamp
  };

  await appendLog(entry);
  return entry;
};

exports.recordEmployeeRestock = async (entry) => {
  return appendLog({
    ...entry,
    actionType: "machine_stock_added",
    summary: `${entry.username} added ${entry.quantityAdded} items to slot ${entry.slotId}`,
    target: {
      type: "machine-slot",
      id: entry.slotId
    },
    details: {
      productId: entry.productId,
      quantityAdded: entry.quantityAdded
    },
    timestamp: entry.timestamp || new Date().toISOString()
  });
};

exports.getActivityLogs = async (limit = 20) => {
  try {
    const content = await fs.readFile(logFile, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean)
      .map(normalizeLegacyRestock)
      .slice(-limit)
      .reverse();
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
};

exports.getEmployeeRestockLogs = exports.getActivityLogs;
