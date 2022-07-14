import { Handler, HandlerResponse } from "@netlify/functions";
import { query } from "../src/common";
import Worker from "web-worker";
import {
  AsyncDuckDB,
  ConsoleLogger,
  selectBundle,
  getJsDelivrBundles,
} from "@duckdb/duckdb-wasm";

const json = (statusCode: number, body: any): HandlerResponse => ({
  statusCode,
  body: JSON.stringify(body, undefined, 2),
});

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  const bundle = await selectBundle(getJsDelivrBundles());

  const db = new AsyncDuckDB(
    new ConsoleLogger(),
    new Worker(bundle.mainWorker!)
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
