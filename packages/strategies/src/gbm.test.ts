/// <reference lib="vitest" />

import { generatePath, generateBatch, derivePathSeed } from "./gbm";

describe("derivePathSeed", () => {
  it("derives different seeds for different path indices", () => {
    const seed = 42n;
    const seeds = [0, 1, 2, 3].map((i) => derivePathSeed(seed, i));
    const unique = new Set(seeds.map((s) => s.toString()));
    expect(unique.size).toBe(4);
  });

  it("derives deterministic seeds", () => {
    const seed = 123n;
    const index = 5;
    expect(derivePathSeed(seed, index)).toBe(derivePathSeed(seed, index));
  });
});

describe("generatePath", () => {
  it("generates a path with the expected number of steps + 1 (including start)", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 10;
    const seed = 42n;
    const path = generatePath(startPrice, drift, volatility, steps, seed);
    expect(path.length).toBe(steps + 1);
  });

  it("generates a path with start price as the first element", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 5;
    const seed = 42n;
    const path = generatePath(startPrice, drift, volatility, steps, seed);
    expect(path[0]).toBeCloseTo(100.0);
  });

  it("with zero drift and zero volatility, path stays at start price", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 10;
    const seed = 42n;
    const path = generatePath(startPrice, drift, volatility, steps, seed);
    for (let i = 0; i < path.length; i++) {
      expect(path[i]).toBeCloseTo(100.0);
    }
  });

  it("is deterministic - same seed produces same path", () => {
    const startPrice = "100.0";
    const drift = "0.01";
    const volatility = "0.2";
    const steps = 20;
    const seed = 42n;
    const path1 = generatePath(startPrice, drift, volatility, steps, seed);
    const path2 = generatePath(startPrice, drift, volatility, steps, seed);
    expect(path1).toEqual(path2);
  });

  it("different seeds produce different paths (with non-zero parameters)", () => {
    const startPrice = "100.0";
    const drift = "0.1";
    const volatility = "0.3";
    const steps = 10;
    const seed1 = 42n;
    const seed2 = 123n;
    const path1 = generatePath(startPrice, drift, volatility, steps, seed1);
    const path2 = generatePath(startPrice, drift, volatility, steps, seed2);
    expect(path1).not.toEqual(path2);
  });
});

describe("generateBatch", () => {
  it("generates a batch with the expected number of paths", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 5;
    const count = 10;
    const seed = 42n;
    const paths = generateBatch(startPrice, drift, volatility, steps, count, seed);
    expect(paths.length).toBe(count);
  });

  it("each path has the expected length", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 8;
    const count = 5;
    const seed = 42n;
    const paths = generateBatch(startPrice, drift, volatility, steps, count, seed);
    expect(paths.length).toBe(count);
    for (const path of paths) {
      expect(path.length).toBe(steps + 1);
    }
  });

  it("is deterministic - same seed and count produces same batch", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 5;
    const count = 3;
    const seed = 42n;
    const batch1 = generateBatch(startPrice, drift, volatility, steps, count, seed);
    const batch2 = generateBatch(startPrice, drift, volatility, steps, count, seed);
    expect(batch1).toEqual(batch2);
  });

  it("different counts produce different numbers of paths", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 5;
    const seed = 42n;
    const batch1 = generateBatch(startPrice, drift, volatility, steps, 3, seed);
    const batch2 = generateBatch(startPrice, drift, volatility, steps, 5, seed);
    expect(batch1.length).toBe(3);
    expect(batch2.length).toBe(5);
  });

  it("each path in batch is independently reproducible", () => {
    const startPrice = "100.0";
    const drift = "0.0";
    const volatility = "0.0";
    const steps = 5;
    const seed = 42n;
    const batch1 = generateBatch(startPrice, drift, volatility, steps, 3, seed);
    const batch2 = generateBatch(startPrice, drift, volatility, steps, 3, seed);
    expect(batch1).toEqual(batch2);
  });

  it("paths in batch are different for different path indices (with non-zero parameters)", () => {
    const startPrice = "100.0";
    const drift = "0.1";
    const volatility = "0.2";
    const steps = 10;
    const seed = 42n;
    const batch = generateBatch(startPrice, drift, volatility, steps, 5, seed);
    const pathSet = new Set(batch.map((p) => p.map((x) => x.toString()).join(",")));
    expect(pathSet.size).toBeGreaterThanOrEqual(2); // at least 2 paths should be different with random variation
  });
});