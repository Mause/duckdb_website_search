import { Handler, HandlerResponse } from "@netlify/functions";
import { readdir } from "fs/promises";
import { readBuilderProgram } from "typescript";

export const handler: Handler = async (event, ctx) => {
  return {
    statusCode: 200,
    json: {
      hello: "world",
      parentDir: await readdir(".."),
      dir: await readdir("."),
    },
  };
};
