// require("whatwg-fetch");
require('wasm-instantiate-streaming');
const { dirname } = require("path");

const url = dirname(require.resolve("@duckdb/duckdb-wasm")) + "/duckdb-browser-mvp.worker.js";

console.log({url});
console.log(WebAssembly.instantiateStreaming);
require(url);
