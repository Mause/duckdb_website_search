import { HandlerResponse } from "@netlify/functions";
import Worker from "web-worker";
// import { dirname } from "path";
import { AsyncDuckDB, ConsoleLogger, selectBundle } from "@duckdb/duckdb-wasm";

// const base = dirname(require.resolve("@duckdb/duckdb-wasm")) + "/";
const base = __dirname + "/duckdb-wasm/";
const pair = (type: string) => ({
  mainModule: base + `duckdb-${type}.wasm`,
  mainWorker: base + `duckdb-node-${type}.worker.cjs`,
});

const DUCKDB_BUNDLES = {
  mvp: pair("mvp"),
  eh: pair("eh"),
};
console.log(DUCKDB_BUNDLES);

export const json = (statusCode: number, body: any): HandlerResponse => ({
  statusCode,
  body: JSON.stringify(body, undefined, 2),
});


export async function initiate() {
  const bundle = await selectBundle(DUCKDB_BUNDLES);
  console.log({ bundle });

  const logger = new ConsoleLogger();
  const worker = new Worker(bundle.mainWorker);
  const db = new AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker, (progress) =>
    console.log(progress)
  );
  return db;
}
