import * as Comlink from "comlink";
import type { DbWorker } from "@/types/db";

let workerInstance: Comlink.Remote<DbWorker> | null = null;

export function getDbWorker(): Comlink.Remote<DbWorker> {
  if (!workerInstance) {
    const worker = new Worker(
      new URL("../workers/db.worker.ts", import.meta.url),
      {
        type: "module"
      }
    );
    workerInstance = Comlink.wrap<DbWorker>(worker);
  }
  return workerInstance;
}
