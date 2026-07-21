import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import type { SpectraTemplate } from '@/oj/types'
import { welcomePageTemplate } from '@/oj/templates/welcomePage'
import { foldoutTemplate } from '@/oj/templates/foldout'
import { buttonTemplate } from '@/oj/templates/button'

/**
 * Registry of Redwood page templates, keyed by the Mateu wire component metadata `type`. Adding a
 * Spectra template = adding ONE data entry here (its oj-sp loaders + a pure DTO→element mapping) —
 * no new markup in the renderer. This is the redwood-spectra analogue of a VisualBuilder page's
 * `imports.components` + template: we worry about the JSON we feed oj-sp, not about the elements.
 */
const spectraTemplates: Partial<Record<string, SpectraTemplate>> = {
  [ComponentMetadataType.HeroSection]: welcomePageTemplate,
  [ComponentMetadataType.FoldoutLayout]: foldoutTemplate,
  [ComponentMetadataType.Button]: buttonTemplate,
}

/** The template for a wire metadata type, or undefined to fall back to the shared base renderer. */
export function resolveSpectraTemplate(type: string | undefined): SpectraTemplate | undefined {
  return type ? spectraTemplates[type] : undefined
}

/**
 * Every oj-sp loader the registered templates need, de-duplicated. Required up front at boot so the
 * custom elements are defined (and thus upgraded) before first paint — property bindings set on a
 * not-yet-upgraded JET element can be missed.
 */
export function allSpectraTemplateLoaders(): string[] {
  return [...new Set(Object.values(spectraTemplates).flatMap((t) => t?.loaders ?? []))]
}
