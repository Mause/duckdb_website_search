import { Handler } from "@netlify/functions";
import { readdir } from "fs/promises";

export const handler: Handler = async (event, ctx) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        hello: "world",
        parentDir: await readdir(".."),
        dir: await readdir("."),
      },
      undefined,
      2
    ),
  };
};
