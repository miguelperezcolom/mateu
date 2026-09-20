// Mechanical validation of a definition against a PUBLISHED Mateu JSON Schema.
//
// This is the whole point of prompt-to-app on Mateu (and of the ADR's §2.14 thesis): unlike
// "AI generates React", the AI here emits a SMALL definition that is checkable against a contract.
// The check is real (ajv over the published draft-07 schema), so a wrong shape is caught and fed
// back for repair instead of shipping.

import Ajv from "ajv";
import { loadSchema } from "./schemas.mjs";

/** Build a validator for a named published schema → (definition) => { valid, errors[] }. */
export function makeValidator(schemaName = "specs") {
  // strict:false — the published schemas use draft-07 keywords like `deprecated` that ajv's strict
  // mode rejects, and Mateu's schemas are deliberately OPEN (a lower bound, no additionalProperties),
  // so validation catches type/shape/required errors, not "unknown component".
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(loadSchema(schemaName));
  return (definition) => {
    const valid = validate(definition) === true;
    const errors = (validate.errors ?? []).map((e) => ({
      path: e.instancePath || "/",
      message: e.message ?? "invalid",
      keyword: e.keyword,
    }));
    return { valid, errors };
  };
}
