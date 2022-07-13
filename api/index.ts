import { VercelApiHandler } from "@vercel/node";

const handler: VercelApiHandler = (res, req) => {
  req.json({ hello: "world" });
};

export default handler;
