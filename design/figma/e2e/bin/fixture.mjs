#!/usr/bin/env node
// npm run fixture — rewrites sample-screens.figma.json (the synthetic fixture) from the plugin's
// sample-screens plan. Run it after changing design/figma/plugin/src/samples.ts or plan.ts; the
// tests fail while it is stale. `--print <dir>` also writes the YAML the converter makes of it.
import { writeFileSync } from 'node:fs'
import { loadContract } from '../../to-yaml/src/load.mjs'
import { syntheticFile } from '../src/synthetic.mjs'
import { SYNTHETIC, convertFixture } from '../src/pipeline.mjs'

writeFileSync(SYNTHETIC, JSON.stringify(syntheticFile(loadContract()), null, 1) + '\n')
console.log(`wrote ${SYNTHETIC}`)
const i = process.argv.indexOf('--print')
if (i > 0) {
  const { files, warnings } = convertFixture(SYNTHETIC, process.argv[i + 1])
  console.log(`wrote ${files.length} pages to ${process.argv[i + 1]}`)
  for (const w of warnings) console.warn(`warning: ${w}`)
}
