import type { Catalogue } from './types'
import { display } from './display'
import { status } from './status'
import { visual } from './visual'
import { structure } from './structure'

/** The wire types drawn outside the core switch (ComponentRenderer), grouped by family. */
export const CATALOGUE: Catalogue = { ...display, ...status, ...visual, ...structure }
