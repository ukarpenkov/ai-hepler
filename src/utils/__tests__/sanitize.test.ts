import { describe, it, expect } from "vitest";
import { sanitizeInput, sanitizeJobText } from "../sanitize.js";

describe("sanitizeInput", () => {
  it("removes HTML tags", () => {
    expect(sanitizeInput("<b>bold</b>")).toBe("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("limits length to 10000 characters", () => {
    const long = "a".repeat(15000);
    expect(sanitizeInput(long).length).toBe(10000);
  });

  it("escapes special characters", () => {
    expect(sanitizeInput('a & b < c > d "e" f \'g\'')).toBe(
      "a &amp; b &lt; c &gt; d &quot;e&quot; f &#x27;g&#x27;"
    );
  });

  it("passes through clean text unchanged", () => {
    expect(sanitizeInput("hello world")).toBe("hello world");
  });
});

describe("sanitizeJobText", () => {
  it("limits length to 50000 characters", () => {
    const long = "a".repeat(60000);
    expect(sanitizeJobText(long).length).toBe(50000);
  });

  it("removes HTML tags", () => {
    expect(sanitizeJobText("<b>bold</b>")).toBe("&lt;b&gt;bold&lt;/b&gt;");
  });
});
