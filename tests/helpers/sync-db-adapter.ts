import type Database from "better-sqlite3";
import type { SQLiteDB, SQLiteStatement } from "@/types/db";

/**
 * Wraps a synchronous better-sqlite3 statement so it conforms to the async
 * SQLiteStatement interface used by db-core. better-sqlite3 itself is fully
 * synchronous; we just wrap each result in a resolved Promise.
 */
function adaptStatement<T>(
  stmt: ReturnType<Database.Database["prepare"]>
): SQLiteStatement<T> {
  // better-sqlite3's run/get/all are typed with overloads that don't accept a
  // spread of unknown[]; cast to a permissive variadic signature.
  const s = stmt as unknown as {
    run: (...p: unknown[]) => {
      changes: number;
      lastInsertRowid: number | bigint;
    };
    get: (...p: unknown[]) => unknown;
    all: (...p: unknown[]) => unknown[];
  };
  return {
    run: async (...params) => s.run(...params),
    get: async (...params) => s.get(...params) as T | undefined,
    all: async (...params) => s.all(...params) as T[]
  };
}

/**
 * Adapts a synchronous better-sqlite3 Database to the async SQLiteDB
 * interface so the same db-core functions can run against it in tests.
 */
export function adaptDb(db: Database.Database): SQLiteDB {
  return {
    exec: async (sql) => {
      db.exec(sql);
    },
    prepare: <T>(sql: string) => adaptStatement<T>(db.prepare(sql)),
    transaction: <T>(fn: (...args: unknown[]) => Promise<T>) => {
      // better-sqlite3's native transaction() does not support async
      // callbacks, so for tests we invoke the async fn directly. Each
      // statement still executes synchronously under the hood.
      return async (...args: unknown[]) => fn(...args);
    }
  };
}
