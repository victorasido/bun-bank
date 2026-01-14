import winston from "winston";
import LokiTransport from "winston-loki";

// Format log jadi JSON biar rapi & bisa difilter di Grafana
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: "info", // Level minimal (info, warn, error)
  format: logFormat,
  defaultMeta: { service: "bun-bank-service" }, // Label otomatis
  transports: [
    // 1. Tulis ke Console (biar kebaca di terminal VSCode)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // 2. Kirim ke Loki (Gudang Log)
    new LokiTransport({
      host: "http://localhost:3100", // Alamat container Loki
      labels: { app: "bun-bank" },   // Label pencarian
      json: true,
      onConnectionError: (err) => console.error("❌ Loki Error:", err),
    }),
  ],
});