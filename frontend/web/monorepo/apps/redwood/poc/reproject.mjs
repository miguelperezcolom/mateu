import { HOST_ID, hostContentOf, entityHeaderOf, withSubresources, islandContentOf, mergeNestedContent, wizardOf } from './reduceContexts.mjs'

// RE-PROJECTION after a change of CLIENT state (a panel folded, a tab, a carousel slide, a Grid
// page, tiles reordered): the content is projected again from the registry already in memory —
// no round trip to the server. The page chains (panelToggled, tilesReordered, uiValueChanged)
// used to repeat this inline, each a slightly different copy; they call this now.

/**
 * The content variables to assign after a client-side change: `hostContent` (null when the host
 * content is not the surface on screen — a wizard step, an empty host — so the chain leaves it
 * alone) and `island` (the island projection with its content refreshed, or null).
 *
 * @param {object} vars  the application variables the chains read (mateuRegistry, mateuHostTitle,
 *                       mateuActiveTabs, mateuHostContent, mateuIsland, mateuIslandId, mateuNestedId)
 */
export function reprojectedContentOf(vars) {
  const reg = vars && vars.mateuRegistry
  const contexts = (reg && reg.contexts) || {}
  const host = contexts[HOST_ID]
  let hostContent = null
  const shown = Array.isArray(vars.mateuHostContent) ? vars.mateuHostContent : []
  if (host && shown.length && !wizardOf(host)) {
    const projected = hostContentOf(host, null, {
      title: vars.mateuHostTitle || '',
      activeTabs: vars.mateuActiveTabs,
      // the header band already paints the host's EntityHeader: without this it came back in the content
      dropEntityHeader: !!entityHeaderOf(host),
    }) || []
    hostContent = withSubresources(projected, contexts)
  }
  let island = null
  const islandCtx = vars.mateuIslandId ? contexts[vars.mateuIslandId] : null
  if (islandCtx && vars.mateuIsland) {
    let content = islandContentOf(islandCtx)
    const nestedCtx = vars.mateuNestedId ? contexts[vars.mateuNestedId] : null
    const nested = nestedCtx ? islandContentOf(nestedCtx) : null
    if (content && nested) content = mergeNestedContent(content, nested)
    island = { ...vars.mateuIsland, content }
  }
  return { hostContent, island }
}
