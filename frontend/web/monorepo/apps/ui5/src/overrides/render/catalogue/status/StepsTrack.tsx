import React from 'react'
import { Wizard, WizardStep } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/accept.js'
import { tx } from '@mr/i18n/texts'
import { StepsTrack as RailTrack } from '@mr/views/render/catalogue/status/StepsTrack'
import { type Dict, str } from '@mr/views/render/catalogue/status/common'

/**
 * Wizard progress (STEPS): Fiori's wizard navigation — ui5-wizard's step bar, the current step
 * selected, the ones done reachable, the upcoming ones disabled. The step's content is the page
 * under it (the server's), so the wizard shows its navigation only. RAIL (`vertical`) keeps the
 * shared list of steps with their descriptions.
 */
export function StepsTrack({ steps, vertical, t }: { steps: Dict[]; vertical: boolean; t: (v: unknown) => string }) {
  if (vertical) return <RailTrack steps={steps} vertical t={t} />
  const allDone = steps.length > 0 && steps.every((s) => str(s['status']) === 'done')
  return (
    <Wizard className="mateu-wizard-nav" accessibleName={tx('progress')}>
      {steps.map((s, i) => {
        const status = str(s['status']) || 'upcoming'
        return (
          <WizardStep key={str(s['id']) || i} titleText={t(s['title'])} subtitleText={s['description'] ? t(s['description']) : undefined}
            icon={status === 'done' ? 'accept' : undefined} selected={status === 'current' || (allDone && i === steps.length - 1) || undefined}
            disabled={status === 'upcoming' || undefined} />
        )
      })}
    </Wizard>
  )
}
