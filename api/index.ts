import { Handler, HandlerResponse } from "@netlify/functions";
import { Database } from "duckdb";
import { query } from "../src/build_index";
import { promisify } from "util";

const json = (statusCode: number, body: any): HandlerResponse => ({
  statusCode,
  body: JSON.stringify(body, undefined, 2),
});

export const handler: Handler = async (event, ctx) => {
  const q = event.queryStringParameters?.q;
  if (!q) {
    return json(422, { error: "missing search query" });
  }

  const db = new Database("search_index.db");
  const all = promisify(db.all.bind(db));

  const results = all(query, q);

  db.close();

  return json(200, {
    results,
    query: q,
  });
};
