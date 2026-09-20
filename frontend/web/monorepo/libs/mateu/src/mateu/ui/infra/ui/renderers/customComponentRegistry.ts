import { TemplateResult } from "lit";

/**
 * The registry behind custom components (coherence-plan #14) — the per-renderer escape hatch for a
 * genuinely NEW rendering the platform does not ship. An app registers a renderer against a type
 * `name`; the wire carries `CustomComponent(name, props, content)` and the shared dispatch looks the
 * name up here. Unlike a business component (`ComponentRef`, composition of known pieces that ports
 * for free), a custom component does NOT port for free: a renderer with no registration for the name
 * degrades to the <mateu-unsupported> placeholder rather than breaking the screen.
 *
 * A renderer receives the declared `props` and the already-rendered slotted `children`, so a custom
 * shell can wrap known components.
 */
export type CustomComponentRenderer = (
    props: Record<string, unknown>,
    children: TemplateResult[]
) => TemplateResult;

const registry = new Map<string, CustomComponentRenderer>();

/** Register a renderer for a custom component type `name`. A later registration replaces an earlier. */
export const registerCustomComponent = (name: string, renderer: CustomComponentRenderer): void => {
    registry.set(name, renderer);
};

/** The renderer registered for `name`, or undefined when the app has registered none. */
export const resolveCustomComponent = (name: string): CustomComponentRenderer | undefined =>
    registry.get(name);

/** Whether a renderer is registered for `name`. */
export const hasCustomComponent = (name: string): boolean => registry.has(name);

/** Drop all registrations. For tests. */
export const clearCustomComponents = (): void => registry.clear();
