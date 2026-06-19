import type { Alert, AlertSeverity } from "./schema";

const SEED: {
  device: string;
  message: string;
  severity: AlertSeverity;
  hoursAgo: number;
}[] = [
  {
    device: "edge-0007",
    message: "CPU temperature exceeded 85°C",
    severity: "critical",
    hoursAgo: 1,
  },
  {
    device: "edge-0019",
    message: "Device went offline",
    severity: "critical",
    hoursAgo: 2,
  },
  {
    device: "edge-0042",
    message: "Packet loss above 5%",
    severity: "warning",
    hoursAgo: 4,
  },
  {
    device: "edge-0103",
    message: "Firmware update available",
    severity: "info",
    hoursAgo: 6,
  },
  {
    device: "edge-0007",
    message: "Fan speed recovered",
    severity: "info",
    hoursAgo: 9,
  },
  {
    device: "edge-0211",
    message: "Disk usage at 92%",
    severity: "warning",
    hoursAgo: 13,
  },
  {
    device: "edge-0058",
    message: "Reboot completed",
    severity: "info",
    hoursAgo: 20,
  },
  {
    device: "edge-0333",
    message: "Battery below 15%",
    severity: "warning",
    hoursAgo: 26,
  },
  {
    device: "edge-0019",
    message: "Heartbeat missed (x3)",
    severity: "critical",
    hoursAgo: 30,
  },
  {
    device: "edge-0480",
    message: "Latency spike to 480ms",
    severity: "warning",
    hoursAgo: 38,
  },
  {
    device: "edge-0125",
    message: "Config drift detected",
    severity: "info",
    hoursAgo: 46,
  },
  {
    device: "edge-0600",
    message: "Sensor calibration due",
    severity: "info",
    hoursAgo: 52,
  },
];

const BASE = new Date(2026, 5, 18, 12, 0, 0).getTime();

export const demoAlerts: Alert[] = SEED.map((row, i) => ({
  id: `alert_${11000 + i}`,
  device: row.device,
  message: row.message,
  severity: row.severity,
  createdAt: new Date(BASE - row.hoursAgo * 60 * 60 * 1000),
}));
