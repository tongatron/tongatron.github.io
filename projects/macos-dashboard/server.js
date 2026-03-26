"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const PORT = Number(process.env.PORT || 3492);
const STATIC_DIR = path.join(__dirname, "public");

let previousNetSample = null;

async function runCommand(command, args = [], timeout = 4000) {
  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout,
      maxBuffer: 8 * 1024 * 1024,
      encoding: "utf8"
    });
    return String(stdout || "").trim();
  } catch {
    return "";
  }
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["yes", "true", "1"].includes(normalized)) return true;
    if (["no", "false", "0"].includes(normalized)) return false;
  }
  return null;
}

function formatCommandErrorSafe(value, fallback = null) {
  return value && value.length ? value : fallback;
}

function parseKeyValueColonText(text) {
  const map = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([^:]+):\s*(.+?)\s*$/);
    if (!match) continue;
    map[match[1].trim()] = match[2].trim();
  }
  return map;
}

function parseIoregProperties(text) {
  const props = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*"([^"]+)"\s*=\s*(.+?)\s*$/);
    if (!match) continue;
    let raw = match[2].trim();
    if (raw.endsWith(",")) raw = raw.slice(0, -1);
    if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
    if (raw === "Yes") raw = true;
    if (raw === "No") raw = false;
    const numeric = Number(raw);
    props[match[1]] = Number.isFinite(numeric) ? numeric : raw;
  }
  return props;
}

function parseVmStat(text) {
  if (!text) return {};
  const lines = text.split("\n").filter(Boolean);
  const first = lines[0] || "";
  const pageSizeMatch = first.match(/page size of\s+(\d+)\s+bytes/i);
  const pageSize = pageSizeMatch ? Number(pageSizeMatch[1]) : 4096;

  const pages = {};
  for (const line of lines.slice(1)) {
    const m = line.match(/^([^:]+):\s+([0-9.]+)/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    pages[key] = Number(String(m[2]).replace(/\./g, ""));
  }

  const active = pages.pages_active || 0;
  const inactive = pages.pages_inactive || 0;
  const wired = pages.pages_wired_down || 0;
  const speculative = pages.pages_speculative || 0;
  const free = pages.pages_free || 0;
  const compressed = pages.pages_occupied_by_compressor || 0;

  const usedPages = active + inactive + wired + speculative;
  const freePages = free;

  return {
    pageSize,
    usedBytes: usedPages * pageSize,
    freeBytes: freePages * pageSize,
    compressedBytes: compressed * pageSize,
    rawPages: pages
  };
}

function parsePmsetBatt(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const sourceLine = lines[0] || "";
  const batteryLine = lines.find((line) => line.includes("InternalBattery")) || "";

  const sourceMatch = sourceLine.match(/Now drawing from '([^']+)'/i);
  const pctMatch = batteryLine.match(/(\d+)%/);
  const statusMatch = batteryLine.match(/\d+%;\s*([^;]+);/);
  const timeMatch = batteryLine.match(/;\s*([^;]+)\s+remaining/i);
  const presentMatch = batteryLine.match(/present:\s*(true|false)/i);

  return {
    source: sourceMatch ? sourceMatch[1] : null,
    percent: pctMatch ? Number(pctMatch[1]) : null,
    state: statusMatch ? statusMatch[1].trim() : null,
    timeRemaining: timeMatch ? timeMatch[1].trim() : null,
    present: presentMatch ? presentMatch[1].toLowerCase() === "true" : null,
    rawLine: formatCommandErrorSafe(batteryLine, null)
  };
}

function parseTopCpuLine(text) {
  const cpuLine = text.split("\n").find((line) => line.includes("CPU usage:"));
  const loadLine = text.split("\n").find((line) => line.startsWith("Load Avg:"));

  let user = null;
  let sys = null;
  let idle = null;
  if (cpuLine) {
    const m = cpuLine.match(/CPU usage:\s*([0-9.]+)% user,\s*([0-9.]+)% sys,\s*([0-9.]+)% idle/i);
    if (m) {
      user = Number(m[1]);
      sys = Number(m[2]);
      idle = Number(m[3]);
    }
  }

  let load = null;
  if (loadLine) {
    const m = loadLine.match(/Load Avg:\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)/i);
    if (m) {
      load = [Number(m[1]), Number(m[2]), Number(m[3])];
    }
  }

  return {
    user,
    sys,
    idle,
    load
  };
}

function parseDf(text) {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const out = [];
  for (const line of lines.slice(1)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;
    const filesystem = parts[0];
    const blocks = Number(parts[1]);
    const used = Number(parts[2]);
    const available = Number(parts[3]);
    const capacity = parts[4];
    const mountedOn = parts.slice(5).join(" ");
    out.push({
      filesystem,
      mountedOn,
      sizeBytes: Number.isFinite(blocks) ? blocks * 1024 : null,
      usedBytes: Number.isFinite(used) ? used * 1024 : null,
      availBytes: Number.isFinite(available) ? available * 1024 : null,
      capacityPercent: capacity.endsWith("%") ? Number(capacity.slice(0, -1)) : null
    });
  }
  return out;
}

function parseIfconfig(text, iface) {
  const statusMatch = text.match(/status:\s*(\w+)/i);
  const mtuMatch = text.match(/mtu\s+(\d+)/i);
  const macMatch = text.match(/ether\s+([0-9a-f:]+)/i);
  const ipMatch = text.match(/\sinet\s+([0-9.]+)/i);
  const ipv6Match = text.match(/\sinet6\s+([0-9a-f:]+[%0-9a-z]*)/i);

  return {
    interface: iface,
    status: statusMatch ? statusMatch[1] : null,
    mtu: mtuMatch ? Number(mtuMatch[1]) : null,
    mac: macMatch ? macMatch[1] : null,
    ipv4: ipMatch ? ipMatch[1] : null,
    ipv6: ipv6Match ? ipv6Match[1] : null
  };
}

function pickPrimaryInterface(routeText) {
  const line = routeText.split("\n").find((l) => l.includes("interface:"));
  if (!line) return "en0";
  const match = line.match(/interface:\s*(\w+)/i);
  return match ? match[1] : "en0";
}

function parseNetstatBytes(text, iface) {
  const lines = text.split("\n").filter(Boolean);
  for (const line of lines.slice(1)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 10) continue;
    if (parts[0] !== iface) continue;
    const network = parts[2] || "";
    if (!network.startsWith("<Link#")) continue;
    const inBytes = toNumber(parts[6]);
    const outBytes = toNumber(parts[9]);
    if (inBytes === null || outBytes === null) continue;
    return { inBytes, outBytes };
  }
  return { inBytes: null, outBytes: null };
}

function parsePsTop(text, limit = 10) {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length <= 1) return [];

  const out = [];
  for (const line of lines.slice(1)) {
    const match = line.match(/^\s*(\d+)\s+([0-9.]+)\s+([0-9.]+)\s+(.+)$/);
    if (!match) continue;
    out.push({
      pid: Number(match[1]),
      cpuPercent: Number(match[2]),
      memPercent: Number(match[3]),
      command: match[4]
    });
    if (out.length >= limit) break;
  }
  return out;
}

function bytesFromHumanString(input) {
  if (!input) return null;
  const match = String(input).trim().match(/^([0-9.]+)\s*(B|KB|MB|GB|TB|PB)?$/i);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = (match[2] || "B").toUpperCase();
  const powers = { B: 0, KB: 1, MB: 2, GB: 3, TB: 4, PB: 5 };
  const power = powers[unit] ?? 0;
  return Math.round(value * 1024 ** power);
}

async function collectSnapshot() {
  const [
    swVersText,
    hardwareText,
    powerText,
    pmsetBattText,
    pmsetThermText,
    ioregBatteryText,
    vmStatText,
    topText,
    dfText,
    routeText,
    psText,
    netstatText
  ] = await Promise.all([
    runCommand("sw_vers"),
    runCommand("system_profiler", ["SPHardwareDataType"], 6000),
    runCommand("system_profiler", ["SPPowerDataType"], 6000),
    runCommand("pmset", ["-g", "batt"]),
    runCommand("pmset", ["-g", "therm"]),
    runCommand("ioreg", ["-rc", "AppleSmartBattery"]),
    runCommand("vm_stat"),
    runCommand("top", ["-l", "1", "-n", "0"], 4000),
    runCommand("df", ["-kP"]),
    runCommand("route", ["-n", "get", "default"]),
    runCommand("ps", ["-A", "-r", "-o", "pid,%cpu,%mem,comm"]),
    runCommand("netstat", ["-ib"])
  ]);

  const swVers = parseKeyValueColonText(swVersText);
  const hw = parseKeyValueColonText(hardwareText);
  const power = parseKeyValueColonText(powerText);
  const batt = parsePmsetBatt(pmsetBattText);
  const thermLines = pmsetThermText.split("\n").map((line) => line.trim()).filter(Boolean);
  const ioregBattery = parseIoregProperties(ioregBatteryText);
  const vm = parseVmStat(vmStatText);
  const top = parseTopCpuLine(topText);
  const storage = parseDf(dfText);
  const primaryInterface = pickPrimaryInterface(routeText);

  const ifconfigText = await runCommand("ifconfig", [primaryInterface]);
  const ifaceInfo = parseIfconfig(ifconfigText, primaryInterface);

  const networkCounters = parseNetstatBytes(netstatText, primaryInterface);
  const nowMs = Date.now();

  let rxRateBps = null;
  let txRateBps = null;
  if (
    previousNetSample &&
    networkCounters.inBytes !== null &&
    networkCounters.outBytes !== null &&
    previousNetSample.inBytes !== null &&
    previousNetSample.outBytes !== null
  ) {
    const dt = (nowMs - previousNetSample.timestampMs) / 1000;
    if (dt > 0) {
      rxRateBps = Math.max(0, (networkCounters.inBytes - previousNetSample.inBytes) / dt);
      txRateBps = Math.max(0, (networkCounters.outBytes - previousNetSample.outBytes) / dt);
    }
  }

  previousNetSample = {
    timestampMs: nowMs,
    inBytes: networkCounters.inBytes,
    outBytes: networkCounters.outBytes
  };

  const memTotalBytes = bytesFromHumanString(hw.Memory || "") || os.totalmem();

  const batteryTempRaw = toNumber(ioregBattery.Temperature);
  const batteryTempC = batteryTempRaw === null ? null : Number(((batteryTempRaw / 10) - 273.15).toFixed(1));

  const topProcesses = parsePsTop(psText, 10);

  const cycleCount = toNumber(power["Cycle Count"]) ?? toNumber(ioregBattery.CycleCount);
  const maxCapacityPercent =
    toNumber(String(power["Maximum Capacity"] || "").replace("%", "")) ?? toNumber(ioregBattery.MaxCapacity);
  const thermalWarningLines = thermLines.filter((line) =>
    /warning|limit|thrott|critical|hot|performance|cpu power status/i.test(line)
  );
  const hasThermalWarning = thermalWarningLines.some((line) => !/\bno\b/i.test(line));

  const snapshot = {
    timestamp: new Date(nowMs).toISOString(),
    system: {
      hostname: os.hostname(),
      osName: swVers.ProductName || os.type(),
      osVersion: swVers.ProductVersion || os.release(),
      osBuild: swVers.BuildVersion || null,
      kernel: os.release(),
      arch: os.arch(),
      uptimeSeconds: os.uptime(),
      loadAvg: top.load || os.loadavg()
    },
    hardware: {
      modelName: hw["Model Name"] || null,
      modelIdentifier: hw["Model Identifier"] || null,
      modelNumber: hw["Model Number"] || null,
      chip: hw.Chip || null,
      totalCores: hw["Total Number of Cores"] || null,
      memoryBytes: memTotalBytes
    },
    cpu: {
      usage: {
        userPercent: top.user,
        systemPercent: top.sys,
        idlePercent: top.idle
      },
      cores: {
        logical: os.cpus()?.length || null
      }
    },
    memory: {
      totalBytes: memTotalBytes,
      usedBytes: vm.usedBytes || null,
      freeBytes: vm.freeBytes || null,
      compressedBytes: vm.compressedBytes || null,
      pageSize: vm.pageSize || null
    },
    power: {
      source: batt.source,
      battery: {
        present: batt.present,
        percent: batt.percent,
        state: batt.state,
        timeRemaining: batt.timeRemaining,
        cycleCount,
        condition: power.Condition || null,
        maxCapacityPercent,
        isCharging: toBoolean(ioregBattery.IsCharging),
        externalConnected: toBoolean(ioregBattery.ExternalConnected),
        fullyCharged: toBoolean(ioregBattery.FullyCharged),
        amperageMa: toNumber(ioregBattery.Amperage),
        voltageMv: toNumber(ioregBattery.Voltage),
        temperatureRaw: batteryTempRaw,
        temperatureC: batteryTempC,
        chargerWatt: toNumber(power["Wattage (W)"])
      },
      thermal: {
        notes: thermLines,
        isWarning: hasThermalWarning
      }
    },
    storage,
    network: {
      primaryInterface,
      status: ifaceInfo.status,
      mtu: ifaceInfo.mtu,
      mac: ifaceInfo.mac,
      ipv4: ifaceInfo.ipv4,
      ipv6: ifaceInfo.ipv6,
      inBytes: networkCounters.inBytes,
      outBytes: networkCounters.outBytes,
      rxRateBps,
      txRateBps
    },
    processes: topProcesses,
    sensors: {
      battery: {
        CurrentCapacity: toNumber(ioregBattery.CurrentCapacity),
        MaxCapacity: toNumber(ioregBattery.MaxCapacity),
        DesignCapacity: toNumber(ioregBattery.DesignCapacity),
        CycleCount: toNumber(ioregBattery.CycleCount),
        Temperature: toNumber(ioregBattery.Temperature),
        Voltage: toNumber(ioregBattery.Voltage),
        Amperage: toNumber(ioregBattery.Amperage),
        InstantAmperage: toNumber(ioregBattery.InstantAmperage),
        ExternalConnected: ioregBattery.ExternalConnected,
        IsCharging: ioregBattery.IsCharging,
        FullyCharged: ioregBattery.FullyCharged
      }
    }
  };

  return snapshot;
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    };

    res.writeHead(200, {
      "Content-Type": typeMap[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/snapshot") {
    try {
      const data = await collectSnapshot();
      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 500, {
        error: "snapshot_failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, now: new Date().toISOString() });
    return;
  }

  const safePath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.normalize(path.join(STATIC_DIR, safePath));

  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Mac dashboard disponibile su http://localhost:${PORT}`);
});
