import { handler } from "../api/index";
import lt from "lambda-tester";
import { HandlerEvent } from "@netlify/functions";

it("main test", async () => {
  const event = {
    httpMethod: "GET",
    queryStringParameters: { q: "hello" },
  } as unknown as HandlerEvent;
  await lt(handler)
    .event(event)
    .expectResolve((result) => {
      console.log(result);
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(
        JSON.stringify({
          message: "Hello world 5",
        })
      );
    });
});
