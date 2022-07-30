import { Handler } from "@netlify/functions";
import { query } from "../src/common";
import { json, initiate } from '../src/api_common';
import fs from 'fs/promises';

const path = 'search_index.db';
const destPath = '/tmp/' + path;
const srcPath = __dirname + '/../' + path;

async function timing<T>(name:string, f: () => Promise<T>): Promise<T> {
  console.timeLog(name);
  const value = await f();
  console.timeEnd(name);
  return value;
}

export const handler: Handler = async (event, ctx) => {
  try {
    await fs.stat(destPath);
    console.log('db exists');
  } catch (e) {
    await timing('coping db', () => fs.copyFile(srcPath, destPath));
  }

  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: 'missing search query' });
  }

  try {
    const db = await timing('initiate', () => initiate());
    const handle = await fs.open(destPath);
    await db.registerFileHandle(destPath, handle.fd);
    await timing('opening', () => db.open({ path: destPath }));
    const conn = await timing('connecting', () => db.connect());

    const prepped = await timing('prepping', () => conn.prepare(query));

    const results = await timing('querying', () => prepped.query(q));

    return json(200, {
      results: results.get(0),
      query: q,
    });
  } catch (e) {
    console.error(e);
    return json(500, {
      error: e.toString(),
      stack: (e as Error).stack?.split('\n'),
    });
  }
};
