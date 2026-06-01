import { describe, it, expect } from "vitest";
import { parseDocument, accessibleName, snippetOf } from "../src/parse.js";

describe("parseDocument", () => {
  const doc = parseDocument(
    `<!doctype html>
<html lang="en">
  <head><title>  Hi  </title></head>
  <body><h1>Heading</h1></body>
</html>`,
  );

  it("extracts title (trimmed) and lang", () => {
    expect(doc.title).toBe("Hi");
    expect(doc.lang).toBe("en");
  });

  it("computes line numbers for elements", () => {
    const h1 = doc.root.querySelector("h1")!;
    expect(doc.lineOf(h1)).toBe(4);
  });
});

describe("accessibleName", () => {
  it("prefers aria-label, then text, then nested alt", () => {
    const doc = parseDocument(
      `<a href="#" aria-label="Close">x</a>
       <button>Save</button>
       <a href="#"><img alt="Home" src="h.png"></a>
       <button></button>`,
    );
    const [a1, a2] = doc.root.querySelectorAll("a");
    const [b1, b2] = doc.root.querySelectorAll("button");
    expect(accessibleName(a1!)).toBe("Close");
    expect(accessibleName(b1!)).toBe("Save");
    expect(accessibleName(a2!)).toBe("Home");
    expect(accessibleName(b2!)).toBe("");
  });
});

describe("snippetOf", () => {
  it("returns a single-line opening tag", () => {
    const doc = parseDocument(`<img\n  src="x.png"\n  alt="y">`);
    const img = doc.root.querySelector("img")!;
    expect(snippetOf(img)).toContain("<img");
    expect(snippetOf(img)).not.toContain("\n");
  });
});
