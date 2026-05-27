"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getDbWorker } from "@/lib/db-client";
import type { DbInitResult, DbProgress, DbWorker } from "@/types/db";
import type { Remote } from "comlink";

interface DbContextValue {
  isReady: boolean;
  progress: DbProgress | null;
  initResult: DbInitResult | null;
  error: Error | null;
  worker: Remote<DbWorker> | null;
  refresh: () => Promise<void>;
}

const DbContext = createContext<DbContextValue | null>(null);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState<DbProgress | null>(null);
  const [initResult, setInitResult] = useState<DbInitResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  // null until useEffect runs (client-only — Worker not available on server)
  const [worker, setWorker] = useState<Remote<DbWorker> | null>(null);

  useEffect(() => {
    const w = getDbWorker();
    setWorker(w);

    w.init((event) => setProgress(event))
      .then((result) => {
        setInitResult(result);
        setIsReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  const refresh = async () => {
    if (!worker) return;
    setIsReady(false);
    setError(null);
    try {
      await worker.refresh((event) => setProgress(event));
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <DbContext.Provider
      value={{
        isReady,
        progress,
        initResult,
        error,
        worker,
        refresh
      }}
    >
      {children}
    </DbContext.Provider>
  );
}

export function useDbContext(): DbContextValue {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error("useDbContext must be used within DbProvider");
  return ctx;
}
