import { Handler, HandlerResponse } from "@netlify/functions";
import { query } from "../src/common";
import { AsyncDuckDB, ConsoleLogger, createWorker } from "@duckdb/duckdb-wasm";

const json = (statusCode: number, body: any): HandlerResponse => ({
  statusCode,
  body: JSON.stringify(body, undefined, 2),
});

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  const db = new AsyncDuckDB(
    new ConsoleLogger(),
    await createWorker("file://" + __dirname)
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
