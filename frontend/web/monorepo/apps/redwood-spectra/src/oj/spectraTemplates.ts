import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import type { SpectraTemplate } from '@/oj/types'
import { welcomePageTemplate } from '@/oj/templates/welcomePage'
import { foldoutTemplate } from '@/oj/templates/foldout'
import { buttonTemplate } from '@/oj/templates/button'
import {
  dashboardLayoutTemplate,
  scoreboardTemplate,
  dashboardPanelTemplate,
  metricCardTemplate,
} from '@/oj/templates/dashboard'
import { entityHeaderTemplate } from '@/oj/templates/entityHeader'
import { verticalLayoutTemplate, horizontalLayoutTemplate } from '@/oj/templates/layouts'
import { cardTemplate } from '@/oj/templates/card'
import { formLayoutTemplate, formRowTemplate } from '@/oj/templates/form'
import { formFieldTemplate, customFieldTemplate } from '@/oj/templates/field'

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
  [ComponentMetadataType.DashboardLayout]: dashboardLayoutTemplate,
  [ComponentMetadataType.Scoreboard]: scoreboardTemplate,
  [ComponentMetadataType.DashboardPanel]: dashboardPanelTemplate,
  [ComponentMetadataType.MetricCard]: metricCardTemplate,
  [ComponentMetadataType.EntityHeader]: entityHeaderTemplate,
  [ComponentMetadataType.VerticalLayout]: verticalLayoutTemplate,
  [ComponentMetadataType.HorizontalLayout]: horizontalLayoutTemplate,
  [ComponentMetadataType.Card]: cardTemplate,
  [ComponentMetadataType.FormLayout]: formLayoutTemplate,
  [ComponentMetadataType.FormRow]: formRowTemplate,
  [ComponentMetadataType.FormField]: formFieldTemplate,
  [ComponentMetadataType.CustomField]: customFieldTemplate,
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
