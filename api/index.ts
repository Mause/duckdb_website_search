import { Handler } from "@netlify/functions";
import { query } from "../src/common";
import { json, initiate } from '../src/api_common';
import { promisify } from 'util';
import fss from 'fs';

const path = 'search_index.db';
const destPath = '/tmp/' + path;
const srcPath = __dirname + '/../' + path;

if (!fss.existsSync(destPath)) {
  console.log('copying db!');
  fss.copyFileSync(
    srcPath,
    destPath
  )
}

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  try {
    const db = await initiate();
    console.log('opening');
    const fd = await promisify(fss.open)(destPath);
    await db.registerFileHandle(destPath, fd);
    await db.open({ path: destPath });
    console.log('connecting');
    const conn = await db.connect();

    console.log('connected');
    const prepped = await conn.prepare(query);

    console.log('querying');
    const results = await prepped.query(q);

    return json(200, {
      results: results.get(0),
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
