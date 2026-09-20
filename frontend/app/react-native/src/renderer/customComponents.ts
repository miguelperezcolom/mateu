import type { ReactNode } from 'react';

/**
 * Custom components (coherence-plan #14) on React Native — the per-renderer escape hatch. An app
 * registers a renderer against a custom type `name`; the wire carries `CustomComponent(name, props,
 * content)` and the dispatch looks the name up here. Where none is registered it degrades to a
 * visible placeholder (still rendering the slotted children), never a broken screen — the RN twin of
 * the web's `registerCustomComponent`/`<mateu-unsupported>`.
 */
export type CustomComponentRenderer = (
  props: Record<string, unknown>,
  children: ReactNode,
) => ReactNode;

const registry = new Map<string, CustomComponentRenderer>();

/** Register a renderer for a custom component type `name`. A later registration replaces an earlier. */
export const registerCustomComponent = (name: string, renderer: CustomComponentRenderer): void => {
  registry.set(name, renderer);
};

/** The renderer registered for `name`, or undefined when the app has registered none. */
export const resolveCustomComponent = (name: string): CustomComponentRenderer | undefined =>
  registry.get(name);
