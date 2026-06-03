"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Comlink from "comlink";
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
  // Stored in a ref — Comlink Remote<T> is a Proxy and must not go through
  // React state (setState treats functions as updater callbacks, corrupting the proxy).
  // A separate boolean flag triggers the re-render that exposes it to consumers.
  const workerRef = useRef<Remote<DbWorker> | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  useEffect(() => {
    const w = getDbWorker();
    workerRef.current = w;
    setWorkerReady(true);

    w.init(Comlink.proxy((event) => setProgress(event)))
      .then((result) => {
        setInitResult(result);
        setIsReady(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  const refresh = async () => {
    if (!workerRef.current) return;
    setIsReady(false);
    setError(null);
    try {
      const result = await workerRef.current.refresh(
        Comlink.proxy((event) => setProgress(event))
      );
      setInitResult(result);
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
        worker: workerReady ? workerRef.current : null,
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
