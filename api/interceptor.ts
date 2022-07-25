// require("whatwg-fetch");
import fetch, { Request } from 'node-fetch';
WebAssembly.instantiateStreaming = require('wasm-instantiate-streaming').instantiateStreaming;
const { dirname } = require("path");

const url = dirname(require.resolve("@duckdb/duckdb-wasm")) + "/duckdb-browser-mvp.worker.js";

global.fetch = fetch as typeof global.fetch;
global.Request = Request as unknown as typeof global.Request;

console.log({ url });
console.log({ instantiateStreaming: WebAssembly.instantiateStreaming, Request: global.Request, XMLHttpRequest: global.XMLHttpRequest, fetch: global.fetch });

try {
    require(url);
} catch (e) {
    console.log('failed to load worker')
    console.error(e);
}
