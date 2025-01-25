import request from "supertest";
import app from "../index.js";

describe("User Routes", () => {
  it("Debería crear un usuario", async () => {
    const res = await request(app).post("/api/users").send({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securePassword123",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("name", "John Doe");
  });
});
