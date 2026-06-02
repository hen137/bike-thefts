import * as SQLite from "wa-sqlite";
import type { SQLiteDB, SQLiteStatement } from "@/types/db";

// `SQLiteAPI` and `SQLiteCompatibleType` are global ambient types declared by
// wa-sqlite's bundled type definitions (src/types/index.d.ts); they are not
// exported from the "wa-sqlite" module, so they're referenced directly.

/**
 * Adapter that wraps wa-sqlite's low-level, pointer-based async C API so it
 * conforms to the async {@link SQLiteDB} interface consumed by db-core.
 *
 * wa-sqlite exposes `open_v2`, `prepare_v2`, `step`, `column`, `bind`,
 * `reset`, `finalize`, etc. There is no better-sqlite3-style high-level API,
 * so this class bridges the gap.
 */

type Params = unknown[];

/**
 * Bind a flat array of JS values to a prepared statement. SQLite binding
 * indices are 1-based.
 */
function bindParams(sqlite3: SQLiteAPI, stmt: number, params: Params): void {
  for (let i = 0; i < params.length; i++) {
    const value = params[i];
    if (value === null || value === undefined) {
      sqlite3.bind_null(stmt, i + 1);
    } else {
      // sqlite3.bind() dispatches to the right bind_* based on JS type.
      sqlite3.bind(stmt, i + 1, value as SQLiteCompatibleType);
    }
  }
}

/**
 * Read the current row of a stepped statement into a plain object keyed by
 * column name.
 */
function readRow<T>(sqlite3: SQLiteAPI, stmt: number): T {
  const columns = sqlite3.column_names(stmt);
  const values = sqlite3.row(stmt);
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < columns.length; i++) {
    obj[columns[i]] = values[i];
  }
  return obj as T;
}

class WaSqliteStatement<T> implements SQLiteStatement<T> {
  #sqlite3: SQLiteAPI;
  #db: number;
  #sql: string;

  constructor(sqlite3: SQLiteAPI, db: number, sql: string) {
    this.#sqlite3 = sqlite3;
    this.#db = db;
    this.#sql = sql;
  }

  /**
   * Compile this statement's SQL, run `body` with the statement pointer, and
   * always finalize afterwards. wa-sqlite only allows one statement per SQL
   * string here (db-core never prepares multi-statement SQL via prepare()).
   */
  async #withStatement<R>(body: (stmt: number) => Promise<R>): Promise<R> {
    const sqlite3 = this.#sqlite3;
    const str = sqlite3.str_new(this.#db, this.#sql);
    try {
      const prepared = await sqlite3.prepare_v2(
        this.#db,
        sqlite3.str_value(str)
      );
      if (!prepared) {
        throw new Error(`Failed to prepare SQL: ${this.#sql}`);
      }
      try {
        return await body(prepared.stmt);
      } finally {
        await sqlite3.finalize(prepared.stmt);
      }
    } finally {
      sqlite3.str_finish(str);
    }
  }

  async run(
    ...params: Params
  ): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
    const sqlite3 = this.#sqlite3;
    return this.#withStatement(async (stmt) => {
      bindParams(sqlite3, stmt, params);
      // Step until done; a run() statement may still emit rows we ignore.
      let rc = await sqlite3.step(stmt);
      while (rc === SQLite.SQLITE_ROW) {
        rc = await sqlite3.step(stmt);
      }
      return {
        changes: sqlite3.changes(this.#db),
        lastInsertRowid: 0
      };
    });
  }

  async get(...params: Params): Promise<T | undefined> {
    const sqlite3 = this.#sqlite3;
    return this.#withStatement(async (stmt) => {
      bindParams(sqlite3, stmt, params);
      const rc = await sqlite3.step(stmt);
      if (rc === SQLite.SQLITE_ROW) {
        return readRow<T>(sqlite3, stmt);
      }
      return undefined;
    });
  }

  async all(...params: Params): Promise<T[]> {
    const sqlite3 = this.#sqlite3;
    return this.#withStatement(async (stmt) => {
      bindParams(sqlite3, stmt, params);
      const rows: T[] = [];
      while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        rows.push(readRow<T>(sqlite3, stmt));
      }
      return rows;
    });
  }
}

/**
 * Wraps a wa-sqlite database handle so it satisfies {@link SQLiteDB}.
 *
 * @param sqlite3 the API instance from `SQLite.Factory(module)`
 * @param db the database pointer returned from `sqlite3.open_v2(...)`
 */
export function createWaSqliteDb(sqlite3: SQLiteAPI, db: number): SQLiteDB {
  return {
    exec: async (sql) => {
      // sqlite3.exec runs all statements in the SQL string (handles the
      // multi-statement schema definition in createSchema).
      await sqlite3.exec(db, sql);
    },
    prepare: <T>(sql: string) => new WaSqliteStatement<T>(sqlite3, db, sql),
    transaction: <R>(fn: (...args: unknown[]) => Promise<R>) => {
      // Wrap the callback in an explicit SQL transaction so a batch of
      // statements commits atomically (and rolls back on error).
      return async (...args: unknown[]): Promise<R> => {
        await sqlite3.exec(db, "BEGIN");
        try {
          const result = await fn(...args);
          await sqlite3.exec(db, "COMMIT");
          return result;
        } catch (err) {
          await sqlite3.exec(db, "ROLLBACK");
          throw err;
        }
      };
    }
  };
}
