// Loads Mateu's PUBLISHED JSON Schemas — the authoring contract the generated definition is checked
// against. Read straight from backend/shared/uidl (the same files editors point IntelliSense at), so
// the harness validates against exactly what Mateu ships, not a copy.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(here, "..", "..", "backend", "shared", "uidl");

export const SCHEMAS = {
  specs: "specs-schema.json", // unified specs/ui/** contract (UI mount / Routes / Sources / definition)
  uidl: "uidl-schema.json", // the component catalog (a page / layout)
  routes: "routes-schema.json", // a mount's routes.yaml (routing table)
  sources: "sources-schema.json", // a sources.yaml (REST source catalogue)
  mount: "mount-schema.json",
};

export function loadSchema(name) {
  const file = SCHEMAS[name];
  if (!file) throw new Error(`Unknown schema '${name}'. Known: ${Object.keys(SCHEMAS).join(", ")}`);
  return JSON.parse(readFileSync(join(schemaDir, file), "utf8"));
}
