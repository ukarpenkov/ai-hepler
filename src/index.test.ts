import { describe, it, expect } from "vitest";

describe("index", () => {
  it("exports successfully", async () => {
    const mod = await import("./index");
    expect(mod).toBeDefined();
  });
});
