import { trace, Span, SpanStatusCode } from "@opentelemetry/api";
import { logger } from "./logger"; // 👈 Import Sekretaris Winston

const tracer = trace.getTracer("bun-bank-service");

/**
 * @Trace Decorator (Hybrid Version: Trace + Log)
 * Otomatis pasang CCTV (Jaeger) dan Catat Buku Tamu (Loki/Winston).
 */
export function Trace(customSpanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 1. Tentukan Nama Operation
      const className = target.constructor.name;
      const spanName = customSpanName || `${className}.${propertyKey}`;

      // 2. [LOG] Catat: "Bos mulai kerja"
      logger.info(`🚀 STARTED: ${spanName}`, {
        class: className,
        method: propertyKey,
        args: args, // Opsional: kalau mau catat parameter input (hati-hati data sensitif!)
      });

      // 3. Mulai CCTV (Jaeger)
      return tracer.startActiveSpan(spanName, async (span: Span) => {
        try {
          // --- JALANKAN LOGIC ASLI ---
          const result = await originalMethod.apply(this, args);

          // 4. [LOG] Catat: "Bos sukses"
          logger.info(`✅ SUCCESS: ${spanName}`, {
            status: "success",
            duration: "auto-calculated-by-loki", // Nanti Loki yang hitung durasi dari timestamp
          });

          return result;

        } catch (error: any) {
          // 5. [LOG] Catat: "Ada Error!"
          logger.error(`❌ ERROR: ${spanName} - ${error.message}`, {
            status: "error",
            errorStack: error.stack,
          });

          // 6. Lapor ke CCTV (Jaeger)
          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });

          throw error;

        } finally {
          // 7. Matikan CCTV
          span.end();
        }
      });
    };

    return descriptor;
  };
}