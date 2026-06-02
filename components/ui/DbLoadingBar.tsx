"use client";

import { useDbContext } from "@/contexts/DbContext";

export function DbLoadingBar() {
  const { progress, isReady, refresh } = useDbContext();

  if (!progress || isReady || progress.type === "ready") return null;

  if (progress.type === "error") {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-3 flex items-center justify-between z-50">
        <span>Error loading data: {progress.message}</span>
        <button
          onClick={refresh}
          className="ml-4 px-3 py-1 bg-white text-red-500 rounded text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const percentage =
    progress.type === "fetching"
      ? Math.round((progress.fetched / progress.total) * 100)
      : Math.round((progress.page / progress.totalPages) * 100);

  const label =
    progress.type === "fetching"
      ? `Loading ${progress.fetched.toLocaleString()} / ${progress.total.toLocaleString()} records`
      : `Indexing page ${progress.page} / ${progress.totalPages}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white z-5000">
      <div className="p-3 flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-sm text-slate-400">{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 bg-blue-500 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
