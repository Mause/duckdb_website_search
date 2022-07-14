import { AsyncDuckDB, ConsoleLogger, createWorker } from "@duckdb/duckdb-wasm";

const queryBuilder = (index_schema: string, index_name: string) => `
SELECT title, score
FROM (SELECT *, fts_${index_schema}_${index_name}.match_bm25(title, ?) AS score
    FROM ${index_name}) sq
WHERE score IS NOT NULL
ORDER BY score DESC;
`;
export const query = queryBuilder('main', 'search_index');

const json = (statusCode: number, body: any): Response => new Response(body, {status: statusCode});

export default async (event, ctx) => {
  const q = event.queryStringParameters?.q;
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
