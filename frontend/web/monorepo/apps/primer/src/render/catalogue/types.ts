import type React from 'react'

export type Dict = Record<string, unknown>

/** What every catalogue component gets: the wire node, its metadata, and the view's state/data. */
export interface CatalogueProps {
  component: Dict
  metadata: Dict
  state: Dict
  data?: unknown
}

export type Catalogue = Record<string, React.ComponentType<CatalogueProps>>
