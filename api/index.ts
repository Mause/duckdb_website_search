import { Handler } from "@netlify/functions";
import { query } from "../src/common";
import { json, initiate } from '../src/api_common';

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  try {
    const db = await initiate();
    console.log('opening');
    const path = 'file:///' + __dirname + "/../search_index.db";
    await db.registerFileURL(path, path);
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
