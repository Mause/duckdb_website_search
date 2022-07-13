import axios from "axios";
import JSZip from "jszip";
import frontMatter from "front-matter";
import duckdb, { Database } from "duckdb";
import { promisify } from "util";

const queryBuilder = (index_schema: string, index_name: string) => `
SELECT title, score
FROM (SELECT *, fts_${index_schema}_${index_name}.match_bm25(title, ?) AS score
    FROM ${index_name}) sq
WHERE score IS NOT NULL
ORDER BY score DESC;
`;
const query = queryBuilder('main', 'search_index');

async function populate_index(
  prep_run: (title: string, body: string) => Promise<unknown>
) {
  const zipball = await axios.get(
    "https://github.com/duckdb/duckdb-web/zipball/master/",
    { responseType: "arraybuffer" }
  );

  const zip = await JSZip.loadAsync(zipball.data);
  for (const [filename, file] of Object.entries(zip.files)) {
    if (filename.endsWith(".md")) {
      const matter = frontMatter<{ title: string }>(
        (await file.async("string")).toString()
      );

      const { title } = matter.attributes;
      if (!title) continue;

      await prep_run(title, matter.body);
    }
  }
}

async function do_work(db: Database) {
  const connection = db.connect();
  const run = promisify(connection.run.bind(connection));
  const exec = promisify(connection.exec.bind(connection));
  const all = promisify(connection.all.bind(connection));

  await run(
    "CREATE TABLE search_index(title VARCHAR, body VARCHAR)"
  );

  const prep = connection.prepare(
    "INSERT INTO search_index (title, body) VALUES (?::STRING, ?::STRING)"
  );
  const prep_run = promisify(prep.run.bind(prep));
  await populate_index(prep_run);
  await promisify(prep.finalize.bind(prep))();

  await run('install "fts"');
  await run('load "fts"');
  console.log("Creating index");
  console.log(await exec("PRAGMA create_fts_index('search_index', 'title', 'body')"));
  console.log("Creating index");

  const results = await all(query, "engine");

  console.log(results);
}

async function main() {
  const db = new duckdb.Database("./search_index.db");

  try {
    await do_work(db);
  } catch (e) {
    console.error(e);
  }

  db.close();
}

if (require.main == module) {
  main().catch(console.error.bind(console));
}
