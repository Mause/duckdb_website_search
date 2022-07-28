import { Handler } from "@netlify/functions";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { json, initiate } from '../src/api_common';

export const handler: Handler = async (_event, _ctx) => {
  let db: AsyncDuckDB;
  try {
    db = await initiate();

    const conn = await db.connect();
    const prepped = await conn.prepare('select 42');
    const results = prepped.query();

    console.log({ results });

  } catch (e) {
    console.error(e);
    return json(500, {
      error: e.toString(),
      stack: (e as Error).stack?.split("\n"),
    });
  }

  return json(200, { db: db.toString() });
}
