import { Handler } from "@netlify/functions";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { json, initiate } from '../src/api_common';

export const handler: Handler = async (_event, _ctx) => {
  let db: AsyncDuckDB;
  try {
    db = await initiate();

    const conn = await db.connect();
    const query = `select * from read_parquet("${__dirname}/duckdb-wasm/lineitem.parquet")`;
    console.log({ query });
    const prepped = await conn.prepare(query);
    const results = await prepped.query();
    await prepped.close();
    await conn.close();

    return json(200, { results: results.get(0) });

  } catch (e) {
    console.error(e);
    return json(500, {
      error: e.toString(),
      stack: (e as Error).stack?.split("\n"),
    });
  }
}
