/**
 * Replaces @vaadin/vaadin-usage-statistics in the bundle (aliased in vite.config.ts).
 *
 * The real module runs only in Vaadin's "development mode" — which it switches on by itself when
 * the page is served from localhost — and then (1) collects usage statistics to send to Vaadin
 * and (2) does it through `Function(…)`, which a Content Security Policy without 'unsafe-eval'
 * reports as a violation. Mateu apps send nothing to third parties and run under a strict CSP, so
 * the collector is a no-op here.
 */
export const usageStatistics = (): void => {}
