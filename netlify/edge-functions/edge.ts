import {
  AsyncDuckDB,
  ConsoleLogger,
  createWorker,
} from "https://github.com/duckdb/duckdb-wasm/blob/master/packages/duckdb-wasm/src/index.ts";

const queryBuilder = (index_schema: string, index_name: string) => `
SELECT title, score
FROM (SELECT *, fts_${index_schema}_${index_name}.match_bm25(title, ?) AS score
    FROM ${index_name}) sq
WHERE score IS NOT NULL
ORDER BY score DESC;
`;
export const query = queryBuilder("main", "search_index");

const json = (statusCode: number, body: any): Response =>
  new Response(body, { status: statusCode });

export default async (request: Request) => {
  const q = new URL(request.url).searchParams.get("q");
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
