import { describe, it, expect } from "vitest";
import { analyze } from "../src/index.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import type { A11ylintConfig, RuleId } from "../src/types.js";

function rulesOf(html: string, config: A11ylintConfig = DEFAULT_CONFIG): Set<RuleId> {
  return new Set(analyze({ source: "x", html }, config).issues.map((i) => i.rule));
}

describe("image rules", () => {
  it("flags missing alt but not decorative images", () => {
    expect(rulesOf(`<img src="a.png">`).has("img-alt")).toBe(true);
    expect(rulesOf(`<img src="a.png" alt="">`).has("img-alt")).toBe(false);
    expect(rulesOf(`<img src="a.png" role="presentation">`).has("img-alt")).toBe(false);
  });

  it("flags redundant alt words", () => {
    expect(rulesOf(`<img src="a.png" alt="photo of a cat">`).has("img-redundant-alt")).toBe(true);
    expect(rulesOf(`<img src="a.png" alt="a sleeping cat">`).has("img-redundant-alt")).toBe(false);
  });
});

describe("form rules", () => {
  it("flags inputs without labels and accepts associated ones", () => {
    expect(rulesOf(`<input type="text">`).has("input-label")).toBe(true);
    expect(rulesOf(`<label for="n">Name</label><input id="n" type="text">`).has("input-label")).toBe(
      false,
    );
    expect(rulesOf(`<label>Name <input type="text"></label>`).has("input-label")).toBe(false);
    expect(rulesOf(`<input type="text" aria-label="Name">`).has("input-label")).toBe(false);
    // submit/hidden don't need a label
    expect(rulesOf(`<input type="submit" value="Go">`).has("input-label")).toBe(false);
  });
});

describe("control rules", () => {
  it("flags empty buttons and links", () => {
    expect(rulesOf(`<button></button>`).has("button-name")).toBe(true);
    expect(rulesOf(`<button>Go</button>`).has("button-name")).toBe(false);
    expect(rulesOf(`<a href="/x"></a>`).has("link-name")).toBe(true);
    expect(rulesOf(`<a href="/x">Home</a>`).has("link-name")).toBe(false);
  });

  it("flags positive tabindex only", () => {
    expect(rulesOf(`<div tabindex="3"></div>`).has("positive-tabindex")).toBe(true);
    expect(rulesOf(`<div tabindex="0"></div>`).has("positive-tabindex")).toBe(false);
  });
});

describe("structure rules", () => {
  it("flags skipped heading levels", () => {
    expect(rulesOf(`<h1>A</h1><h3>B</h3>`).has("heading-order")).toBe(true);
    expect(rulesOf(`<h1>A</h1><h2>B</h2>`).has("heading-order")).toBe(false);
  });

  it("flags non-li children of lists", () => {
    expect(rulesOf(`<ul><div>x</div></ul>`).has("list-structure")).toBe(true);
    expect(rulesOf(`<ul><li>x</li></ul>`).has("list-structure")).toBe(false);
  });
});

describe("aria rules", () => {
  it("flags invalid roles and attributes", () => {
    expect(rulesOf(`<div role="buton">x</div>`).has("aria-role-valid")).toBe(true);
    expect(rulesOf(`<div role="button">x</div>`).has("aria-role-valid")).toBe(false);
    expect(rulesOf(`<div aria-labeledby="x">y</div>`).has("aria-attr-valid")).toBe(true);
    expect(rulesOf(`<div aria-labelledby="x">y</div>`).has("aria-attr-valid")).toBe(false);
  });

  it("flags focusable content inside aria-hidden", () => {
    expect(rulesOf(`<div aria-hidden="true"><a href="/x">y</a></div>`).has("aria-hidden-focus")).toBe(
      true,
    );
    expect(rulesOf(`<div aria-hidden="true"><span>y</span></div>`).has("aria-hidden-focus")).toBe(
      false,
    );
  });
});

describe("language rules", () => {
  it("flags missing lang, title, duplicate ids, and unscalable viewport", () => {
    expect(rulesOf(`<html><head></head><body>x</body></html>`).has("html-lang")).toBe(true);
    expect(rulesOf(`<html lang="en"><head></head><body>x</body></html>`).has("html-lang")).toBe(
      false,
    );
    expect(rulesOf(`<div id="a"></div><div id="a"></div>`).has("duplicate-id")).toBe(true);
    expect(
      rulesOf(`<meta name="viewport" content="width=device-width, user-scalable=no">`).has(
        "meta-viewport-scalable",
      ),
    ).toBe(true);
  });
});

describe("table rules", () => {
  it("flags tables without headers/caption and accepts good ones", () => {
    const bad = rulesOf(`<table><tr><td>a</td><td>b</td></tr></table>`);
    expect(bad.has("table-headers")).toBe(true);
    expect(bad.has("table-caption")).toBe(true);
    const good = rulesOf(
      `<table><caption>C</caption><tr><th scope="col">a</th><th scope="col">b</th></tr></table>`,
    );
    expect(good.has("table-headers")).toBe(false);
    expect(good.has("table-caption")).toBe(false);
  });

  it("skips layout tables", () => {
    expect(rulesOf(`<table role="presentation"><tr><td>x</td></tr></table>`).has("table-headers")).toBe(
      false,
    );
  });
});

describe("color rule", () => {
  it("flags low contrast inline text", () => {
    expect(
      rulesOf(`<p style="color:#bbbbbb;background-color:#ffffff">x</p>`).has("contrast-inline"),
    ).toBe(true);
    expect(
      rulesOf(`<p style="color:#222;background-color:#fff">x</p>`).has("contrast-inline"),
    ).toBe(false);
  });
});

describe("WCAG level filtering", () => {
  it("with minLevel A, AA issues are excluded", () => {
    const html = `<meta name="viewport" content="user-scalable=no"><img src="a.png">`;
    const a = rulesOf(html, { ...DEFAULT_CONFIG, minLevel: "A" });
    expect(a.has("img-alt")).toBe(true); // level A
    expect(a.has("meta-viewport-scalable")).toBe(false); // level AA, excluded
    const aa = rulesOf(html, { ...DEFAULT_CONFIG, minLevel: "AA" });
    expect(aa.has("meta-viewport-scalable")).toBe(true);
  });
});
