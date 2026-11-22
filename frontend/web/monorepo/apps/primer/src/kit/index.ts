/**
 * The Primer renderer's KIT: the shared views (frontend/web/react-renderer/views) draw with `@kit`,
 * and here `@kit` IS Primer React — its whole public API, plus the experimental components the
 * views use. Another renderer's kit implements the same names (the contract:
 * frontend/web/react-renderer/views/kit-contract.json) in its own design system.
 */
export * from '@primer/react'
export { Blankslate, DataTable, SkeletonText, Table, UnderlinePanels } from '@primer/react/experimental'
