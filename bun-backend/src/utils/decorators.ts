//set up tracing and logging decorator
import { trace, Span, SpanStatusCode } from "@opentelemetry/api";
import { logger } from "./logger"; 

const tracer = trace.getTracer("bun-bank-service");

// Fungsi untuk membersihkan argumen sebelum dilog
function cleanArgs(args: any[]): any[] {
  try {
    return args.map((arg) => {
      
      if (!arg) return arg; // cek null atau undefined
      
      
      if (typeof arg !== "object") return arg; //cek tipe data

      // DETEKSI PRISMA / KONEKSI DATABASE
      // objek Prisma: $transaction, $connect, atau $queryRaw
      const isPrisma = "$transaction" in arg || "$connect" in arg || "$executeRaw" in arg;
      if (isPrisma) {
        return "[🔌 Database Connection - REDACTED]";
      }

      // DETEKSI CIRCULAR OBJEK / COMPLEX DATA
      try {
        JSON.stringify(arg); // test stringify
        return arg; 
      } catch (e) {
        return "[🔄 Circular/Complex Data - REDACTED]";
      }
    });
  } catch (err) {
    //error = array kosong
    return ["[Error cleaning args]"];
  }
}

// set up decorator Trace
export function Trace(customSpanName?: string) {
  return function (
    target: any, //class yang punya function
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    //penjelasan isi log
    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;
      const spanName = customSpanName || `${className}.${propertyKey}`;
      
      // Sanitasi argumem
      const safeArgs = cleanArgs(args);

      console.log(`[DEBUG] 🚀 Executing: ${spanName}`); 

      // Log ke Winston (Loki)
      logger.info(`🚀 STARTED: ${spanName}`, {
        class: className,
        method: propertyKey,
        args: safeArgs, 
      });

      //set tracing span
      return tracer.startActiveSpan(spanName, async (span: Span) => {
        try {
          const result = await originalMethod.apply(this, args);

          logger.info(`✅ SUCCESS: ${spanName}`, {
            status: "success",
          });

          return result;

        } catch (error: any) {
          console.error(`[DEBUG] ❌ Error in ${spanName}:`, error.message);

          logger.error(`❌ ERROR: ${spanName} - ${error.message}`, {
            status: "error",
            errorStack: error.stack,
          });

          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });

          throw error;

        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}