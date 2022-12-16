import { Handler } from "@netlify/functions";
import { query } from "../src/common";
import { json, initiate, timing } from "../src/api_common";
import fs from "fs/promises";
import { Struct, Int16, Binary } from "apache-arrow";
import { PreparedStatement } from "@duckdb/duckdb-wasm/dist/types/src/bindings";
import { AsyncPreparedStatement } from "@duckdb/duckdb-wasm";
import { maxHeaderSize } from "http";

const path = "search_index.db";
const destPath = "/tmp/" + path;
const srcPath = __dirname + "/../" + path;
type Shape = { title: Binary; scope: Int16 };

export const handler: Handler = async (event, ctx) => {
  try {
    await fs.stat(destPath);
    console.log("db exists");
  } catch (e) {
    await timing("copying db", () => fs.copyFile(srcPath, destPath));
  }

  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  try {
    const db = await initiate();
    const handle = await fs.open(destPath);
    await db.registerFileHandle(destPath, handle.fd);
    await timing("opening", () => db.open({ path: destPath }));
    const conn = await timing("connecting", () => db.connect());

    const prepped: AsyncPreparedStatement<Shape> = await timing(
      "prepping",
      () => conn.prepare(query)
    );

    const results = await timing("querying", () => prepped.query(q));

    const rows: Struct<Shape>["TValue"][] = [];
    for (let i = 0; i < results.numRows; i++) {
      const row = results.get(i);
      row && rows.push(row);
    }

    return json(200, {
      query: q,
      rows,
    });
  } catch (e) {
    console.error(e);
    const error = e as Error;
    return json(500, {
      error: error.toString(),
      stack: error.stack?.split("\n"),
    });
  }
};
