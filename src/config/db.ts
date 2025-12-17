// Minimal DB stub for local compile/run without pg dependency
// Replace with real PG Pool connection in production/dev with proper types
export const db = {
  query: async (sql: string, params?: any[]) => {
    return { rows: [] } as { rows: any[] };
  },
};
