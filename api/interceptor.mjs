import fetch, { Request } from 'node-fetch';
import { instantiateStreaming } from 'wasm-instantiate-streaming';
import { dirname } from "path";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const url = dirname(require.resolve("@duckdb/duckdb-wasm")) + "/duckdb-browser-mvp.worker.js";

WebAssembly.instantiateStreaming = instantiateStreaming;
global.fetch = fetch;
global.Request = Request;

console.log({ url });
console.log({ instantiateStreaming: WebAssembly.instantiateStreaming, Request: global.Request, XMLHttpRequest: global.XMLHttpRequest, fetch: global.fetch });

try {
    require(url);
} catch (e) {
    console.log('failed to load worker')
    console.error(e);
}
