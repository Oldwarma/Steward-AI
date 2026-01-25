const fs = require("fs");
const path = require("path");

// Load .env for this standalone script (Next/Prisma CLI load it automatically, node doesn't)
try {
  const envPath = path.join(__dirname, "..", ".env");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
} catch (_) {
  // ignore
}

const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe("SELECT 1 as ok");
    console.log("db ok:", rows);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("db fail:", e);
  process.exit(1);
});
