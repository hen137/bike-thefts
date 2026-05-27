"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  // Initialize worker synchronously so it is available before useEffect fires
  const workerRef = useRef<Remote<DbWorker>>(getDbWorker());

  useEffect(() => {
    const worker = workerRef.current;

    worker
      .init((event) => setProgress(event))
      .then((result) => {
        setInitResult(result);
        setIsReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  const refresh = async () => {
    setIsReady(false);
    setError(null);
    try {
      await workerRef.current.refresh((event) => setProgress(event));
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
        worker: workerRef.current,
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
