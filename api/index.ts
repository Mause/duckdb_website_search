import { Handler, HandlerResponse } from "@netlify/functions";
import { query } from "../src/common";
import Worker from "web-worker";
import { dirname } from "path";
import { readdirSync } from "fs";
import { AsyncDuckDB, ConsoleLogger, selectBundle } from "@duckdb/duckdb-wasm";

console.log(global.Request, global.fetch);

const base = dirname(require.resolve("@duckdb/duckdb-wasm")) + "/";
const pair = (type: string) => ({
  mainModule: base + `duckdb-${type}.wasm`,
  mainWorker: base + `duckdb-browser-${type}.worker.js`,
});

console.log(readdirSync("."), readdirSync("api"));

const DUCKDB_BUNDLES = {
  mvp: { ...pair("mvp"), mainWorker: require.resolve("./interceptor.mjs") },
  eh: pair("eh"),
  coi: {
    ...pair("coi"),
    pthreadWorker: base + "duckdb-browser-coi.pthread.worker.js",
  },
};

const json = (statusCode: number, body: any): HandlerResponse => ({
  statusCode,
  body: JSON.stringify(body, undefined, 2),
});

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  const bundle = await selectBundle(DUCKDB_BUNDLES);
  console.log({ bundle });

  const db = new AsyncDuckDB(
    new ConsoleLogger(),
    new Worker(bundle.mainWorker!, { type: "module" })
  );
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker, (progress) =>
    console.log(progress)
  );
  await db.open({ path: "search_index.db" });
  const conn = await db.connect();

  const prepped = await conn.prepare(query);

  const results = prepped.query(q);

  return json(200, {
    results,
    query: q,
  });
};
