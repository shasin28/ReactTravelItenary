import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";

describe("Health Route", () => {
  it("should return OK message", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "OK" });
  });
});
