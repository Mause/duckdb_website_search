import { Handler } from "@netlify/functions";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { json, initiate } from "../src/api_common";
import { readFile } from "fs/promises";

export const handler: Handler = async (_event, _ctx) => {
  let db: AsyncDuckDB;
  try {
    db = await initiate();

    const conn = await db.connect();
    const filename = `${__dirname}/duckdb-wasm/lineitem.parquet`;
    const buff = await readFile(filename);
    console.log({ filename, buff });
    await db.registerFileBuffer(filename, buff);
    const query = `select * from read_parquet('${filename}')`;
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
};
