import request from "supertest";

import app from "./app";

test("GET /api", async () => {
  const res = await request(app).get("/api");
  expect(res.body).toEqual({ message: "Hello world!" });
});
