const fs = require("fs/promises");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");
const logFile = path.join(logDir, "employee-restocks.jsonl");

async function ensureLogDir() {
  await fs.mkdir(logDir, { recursive: true });
}

exports.recordEmployeeRestock = async (entry) => {
  await ensureLogDir();
  await fs.appendFile(logFile, `${JSON.stringify(entry)}\n`, "utf8");
};

exports.getEmployeeRestockLogs = async (limit = 20) => {
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
      .slice(-limit)
      .reverse();
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
};
