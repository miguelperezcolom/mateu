#!/usr/bin/env node
// Re-copies the authoring resources from backend/shared/uidl (their single source) into
// resources/. The copies are pinned byte-equal to the source by authoring.test.mjs.
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { RESOURCE_FILES } from "../authoring.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "..", "backend", "shared", "uidl");
const target = join(here, "..", "resources");

for (const file of RESOURCE_FILES) {
  copyFileSync(join(source, file), join(target, file));
  process.stdout.write(`copied ${file}\n`);
}
