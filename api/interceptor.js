// require("whatwg-fetch");
WebAssembly.instantiateStreaming = require('wasm-instantiate-streaming').instantiateStreaming;
const { dirname } = require("path");

const url = dirname(require.resolve("@duckdb/duckdb-wasm")) + "/duckdb-browser-mvp.worker.js";

console.log({url});
console.log(WebAssembly.instantiateStreaming);
require(url);
