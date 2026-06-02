// wa-sqlite ships type declarations for several example VFS modules
// (IndexedDbVFS, MemoryVFS, etc.) but NOT for AccessHandlePoolVFS, which is
// the synchronous OPFS-backed VFS we use in the DB worker. Declare it here so
// the import in workers/db.worker.ts is typed instead of implicitly `any`.
declare module "wa-sqlite/src/examples/AccessHandlePoolVFS.js" {
  // wa-sqlite's bundled VFS.Base typings differ slightly from the SQLiteVFS
  // interface that `vfs_register` expects (e.g. the xRead pData shape), so we
  // declare only the members we use and cast at the call site.
  export class AccessHandlePoolVFS {
    /**
     * @param directoryPath OPFS directory that holds the VFS's files.
     */
    constructor(directoryPath: string);
    /** Resolves once OPFS access handles have been opened. */
    readonly isReady: Promise<void>;
    /** VFS name passed to `sqlite3.open_v2(...)`. */
    readonly name: string;
  }
}
