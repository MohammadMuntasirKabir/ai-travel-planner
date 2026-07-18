// tests/paths.ts - Path resolution helper for vi.mock()
// This module must be imported BEFORE any vi.mock() calls in test files.

import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

export function abs(relativePath: string): string {
  return path.resolve(ROOT, relativePath);
}
