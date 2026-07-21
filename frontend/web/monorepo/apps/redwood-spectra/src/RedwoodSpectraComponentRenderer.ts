import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'

/**
 * The Redwood Spectra renderer. Starts by deferring everything to the shared
 * {@link BasicComponentRenderer} (so every screen already renders), and we override one wire type
 * at a time to draw it with the Oracle JET / Spectra components (oj-c-* and oj-sp-*) loaded from
 * Oracle's CDN — building the Redwood look up incrementally.
 *
 * Override points to fill in (each returns a Lit TemplateResult): renderClientSideComponent for
 * Card/Text/Tabs/Dialog…, renderButton, renderField, renderAppComponent (the Spectra Shell), etc.
 * See the sibling redwood-oj renderer for the full set of hooks.
 */
export class RedwoodSpectraComponentRenderer extends BasicComponentRenderer {}
