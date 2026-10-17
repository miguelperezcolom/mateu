import { registerLazyElement } from '@infra/ui/lazyElements.ts'

/**
 * The Vaadin elements only some fields draw, loaded on first use (see libs/mateu lazyElements.ts):
 * vaadin-markdown (with marked) for markdown fields, vcf-date-range-picker for date ranges.
 */
registerLazyElement('vaadin-markdown', () => import('@vaadin/markdown'))
// @ts-expect-error -- the package ships no type declarations; it is imported only to define the element
registerLazyElement('vcf-date-range-picker', () => import('@vaadin-component-factory/vcf-date-range-picker'))
