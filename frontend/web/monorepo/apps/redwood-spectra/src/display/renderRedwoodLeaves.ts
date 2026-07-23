import { type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Avatar from '@mateu/shared/apiClients/dtos/componentmetadata/Avatar'
import type ProgressBar from '@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar'
import { ojElement } from '../oj/ojDriver'

/** Mateu `Avatar` → authentic `oj-c-avatar` (initials/src/size). */
export function renderRedwoodAvatar(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as Avatar
  return ojElement('oj-c-avatar', {
    props: {
      initials: m.abbreviation || undefined,
      src: m.image || undefined,
      size: 'md',
    },
    attrs: {
      slot: component.slot || undefined,
      title: m.name || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
  })
}

/** Mateu `ProgressBar` → authentic `oj-c-progress-bar` (value 0..max; value=-1 = indeterminate). */
export function renderRedwoodProgressBar(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as ProgressBar
  const max = m.max && m.max > 0 ? m.max : 100
  const value = m.indeterminate ? -1 : (m.value ?? 0)
  return ojElement('oj-c-progress-bar', {
    props: { value, max },
    attrs: {
      slot: component.slot || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
  })
}
