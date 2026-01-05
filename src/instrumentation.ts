//import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node"; //otak/tulang utama OpenTelemetry di Node.js
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"; //otomatisasi instrumentasi buat Node.js
import { resourceFromAttributes } from "@opentelemetry/resources"; //buat nentuin resource/service kita/ktp(atribute=value)
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions"; //standar nama service

// Import ConsoleSpanExporter untuk output ke terminal
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";

// report to terminal
const traceExporter = new ConsoleSpanExporter(); 

// Inisialisasi NodeSDK OpenTelemetry
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "bun-bank-service",
  }),
  traceExporter, // Pasang kabel ke terminal
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log(" OpenTelemetry (Output ke Terminal) aktif!");

//sistem pemantau otomatis (CCTV) yang menyusup ke dalam aplikasi bank
//merekam jalur eksekusi dan durasi setiap aktivitas, seperti request HTTP atau query database, 
//tanpa perlu mengubah kode aslinya. menggunakan NodeSDK untuk mengaktifkan sensor "Auto-Instrumentation"
//melacak apa yang terjadi di balik layar, memberi label data tersebut dengan nama "bun-bank-service", 
//dan akhirnya mencetak seluruh laporan detailnya langsung ke layar terminal/comsole