import { Handler } from "@netlify/functions";
import { query } from "../src/common";
import { json, initiate } from '../src/api_common';
import fs from 'fs/promises';

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  try {
    const db = await initiate();
    console.log('opening');
    const path = 'search_index.db';
    const url = 'https://duckdb-website-search.netlify.app/' + path;
    console.log({ db, path, url });
    const fd = await fs.open(__dirname + '/../' + path, 'r+');
    await db.registerFileHandle(path, fd);
    await db.open({ path });
    console.log('connecting');
    const conn = await db.connect();

    const prepped = await conn.prepare(query);

    const results = prepped.query(q);

    return json(200, {
      results,
      query: q,
    });
  } catch (e) {
    console.error(e);
    return json(500, {
      error: e.toString(),
      stack: (e as Error).stack?.split("\n"),
    });
  }
};
