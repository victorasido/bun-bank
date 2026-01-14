import { trace, Span, SpanStatusCode } from "@opentelemetry/api";

// 1. Inisialisasi Tracer Global
// Nama tracer disamakan dengan yang ada di instrumentation.ts
const tracer = trace.getTracer("bun-bank-service");

/**
 * @Trace Decorator
 * "Stiker Ajaib" untuk membungkus method dengan OpenTelemetry Span secara otomatis.
 * * Cara Pakai:
 * @Trace("nama-span-custom")
 * async myMethod() { ... }
 */
export function Trace(customSpanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Simpan fungsi asli yang belum ditempel stiker
    const originalMethod = descriptor.value;

    // Ganti fungsi asli dengan fungsi "bajakan" (Wrapper)
    descriptor.value = async function (...args: any[]) {
      
      // Tentukan nama span: Pakai nama custom ATAU nama Class.Method otomatis
      const className = target.constructor.name;
      const spanName = customSpanName || `${className}.${propertyKey}`;

      // Mulai Stopwatch (Start Span)
      return tracer.startActiveSpan(spanName, async (span: Span) => {
        try {
          // Jalankan fungsi asli (Kado dibuka)
          const result = await originalMethod.apply(this, args);
          
          // Kalau sukses, return hasilnya
          return result;

        } catch (error) {
          // Kalau Error: Lapor ke Jaeger (Record Exception)
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          });
          
          // Lempar errornya lagi ke atas biar Controller tau ada error
          throw error;

        } finally {
          // Wajib matikan stopwatch (End Span)
          span.end();
        }
      });
    };

    return descriptor;
  };
}