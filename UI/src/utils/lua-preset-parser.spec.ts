import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LuaPresetParser } from "./lua-preset-parser";

const fixturePath = (relativePath: string) =>
  fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url));

describe("LuaPresetParser", () => {
  it("parses the bundled equalizer presets", async () => {
    const source = await readFile(
      fixturePath("wasm/equalizer/presets.lua"),
      "utf8",
    );
    const presets = new LuaPresetParser().parsePresets(source, "equalizer");

    expect(presets.length).toBeGreaterThan(0);
    expect(presets[0]).toMatchObject({ name: "Flat" });
    expect(presets[0].bands).toHaveLength(16);
  });

  it("parses the bundled spatializer presets", async () => {
    const source = await readFile(
      fixturePath("wasm/spatializer/spatializer_presets.lua"),
      "utf8",
    );
    const presets = new LuaPresetParser().parsePresets(source, "spatializer");

    expect(presets.length).toBeGreaterThan(0);
    expect(presets[0]).toMatchObject({
      name: "Auditorium",
      params: { width: 1.4, decay: 0.7, damping: 0.4, mix: 0.35 },
    });
  });
});

describe("LuaPresetParser (edge cases)", () => {
  const parse = (lua: string) =>
    new LuaPresetParser().parsePresets(lua, "equalizer");

  it("ignores line comments containing '=' signs", () => {
    const presets = parse(`
presets = {
  {
    name = "Commented",
    description = "desc",
    bands = {
      { frequency = 100, gain = 1.5, q = 0.8 } -- frequency = 42, gain = 99
    }
  }
}
`);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe("Commented");
    expect(presets[0].bands).toEqual([
      { frequency: 100, gain: 1.5, q: 0.8 },
    ]);
  });

  it("parses presets with fewer than 10 bands", () => {
    const presets = parse(`
presets = {
  {
    name = "Three Bands",
    bands = {
      { frequency = 100, gain = 1.0, q = 1.0 },
      { frequency = 200, gain = -2.5, q = 0.5 },
      { frequency = 400, gain = 3.0, q = 2.0 }
    }
  }
}
`);
    expect(presets).toHaveLength(1);
    expect(presets[0].bands).toHaveLength(3);
    expect(presets[0].bands[1]).toEqual({ frequency: 200, gain: -2.5, q: 0.5 });
  });

  it("returns [] for an empty presets table", () => {
    expect(parse("presets = {}")).toEqual([]);
  });

  it("handles quotes and backslashes in the name field", () => {
    const presets = parse(`
presets = {
  {
    name = "My \\"Custom\\" Mix",
    bands = {
      { frequency = 100, gain = 1.0, q = 1.0 }
    }
  }
}
`);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe('My "Custom" Mix');
  });

  it("returns null from extractBalancedBrace for unbalanced braces", () => {
    const parser = new LuaPresetParser() as any;
    expect(parser.extractBalancedBrace("{ { a = 1 }", 0)).toBeNull();

    // Unbalanced input must not throw and must not produce presets
    const presets = parse(`
presets = {
  {
    name = "Broken",
    bands = {
      { frequency = 100, gain = 1.0, q = 1.0 }
`);
    expect(presets).toEqual([]);
  });

  it("does not let a --[[ ]] block comment break parsing", () => {
    const presets = parse(`
--[[
  Block comment header: presets = { { name = "Fake" } }
]]
presets = {
  {
    name = "Real",
    bands = {
      { frequency = 100, gain = 1.0, q = 1.0 }
    }
  }
}
`);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe("Real");
  });

  it("keeps other fields intact when version is numeric", () => {
    const presets = parse(`
presets = {
  {
    name = "Versioned",
    description = "mentions gain = 5 inside a string",
    version = 2,
    bands = {
      { frequency = 100, gain = 1.0, q = 1.0 }
    }
  }
}
`);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe("Versioned");
    expect(presets[0].description).toBe("mentions gain = 5 inside a string");
    expect(presets[0].version).toBe(2);
    expect(presets[0].bands).toEqual([{ frequency: 100, gain: 1.0, q: 1.0 }]);
  });

  it("returns all presets from a file with 3+ presets", () => {
    const band = (f: number) =>
      `{ frequency = ${f}, gain = 1.0, q = 1.0 }`;
    const presets = parse(`
presets = {
  { name = "One", bands = { ${band(100)} } },
  { name = "Two", bands = { ${band(200)} } },
  { name = "Three", bands = { ${band(300)} } },
  { name = "Four", bands = { ${band(400)} } }
}
`);
    expect(presets.map((p: any) => p.name)).toEqual([
      "One",
      "Two",
      "Three",
      "Four",
    ]);
    expect(presets[3].bands).toEqual([{ frequency: 400, gain: 1.0, q: 1.0 }]);
  });
});
