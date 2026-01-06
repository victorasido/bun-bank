//import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node"; //otak/tulang utama OpenTelemetry di Node.js
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"; //otomatisasi instrumentasi buat Node.js
import { Resource } from "@opentelemetry/resources"; //buat nentuin resource/service kita/ktp(atribute=value)

import { PrismaInstrumentation } from "@prisma/instrumentation";

// Import Protocol
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"; 

// Setup Exporter ke Jaeger (Port 4318 adalah default HTTP OTLP)
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

// Inisialisasi NodeSDK OpenTelemetry
const sdk = new NodeSDK({
  resource: new Resource({
    "service.name": "bun-bank-service",
  }),
  traceExporter, // Pasang kabel ke jager
  instrumentations: [
    getNodeAutoInstrumentations(),
    new PrismaInstrumentation(), // Pasang Prisma Instrumentation
  ],
});

sdk.start();
console.log(" OpenTelemetry (port 16686) aktif!");

//sistem pemantau otomatis (CCTV) yang menyusup ke dalam aplikasi bank
//merekam jalur eksekusi dan durasi setiap aktivitas, seperti request HTTP atau query database, 
//tanpa perlu mengubah kode aslinya. menggunakan NodeSDK untuk mengaktifkan sensor "Auto-Instrumentation"
//melacak apa yang terjadi di balik layar, memberi label data tersebut dengan nama "bun-bank-service", 
//dan akhirnya mencetak seluruh laporan detailnya langsung ke port 16686,