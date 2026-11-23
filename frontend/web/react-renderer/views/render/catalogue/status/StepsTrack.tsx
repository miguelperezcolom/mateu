import React from 'react'
import { Text } from '@kit'
import { CheckCircleFillIcon, CircleIcon, DotFillIcon } from '@kit/icons'
import { type Dict, str } from './common'

/**
 * ProgressSteps' track: a row of bullets, or a rail when `vertical`. A design system with its own
 * stepper markup (SLDS: Path, the vertical Progress Indicator) overrides this file.
 */
export function StepsTrack({ steps, vertical, t }: { steps: Dict[]; vertical: boolean; t: (v: unknown) => string }) {
  return (
    <ol className={vertical ? 'mateu-st-steps-v' : 'mateu-st-steps'}>
      {steps.map((s, i) => {
        const status = str(s['status']) || 'upcoming'
        const Icon = status === 'done' ? CheckCircleFillIcon : status === 'current' ? DotFillIcon : CircleIcon
        return (
          <li key={str(s['id']) || i} className={`mateu-st-step mateu-st-step-${status}`} aria-current={status === 'current' ? 'step' : undefined}>
            <span className="mateu-st-step-dot"><Icon size={16} /></span>
            <span className="mateu-st-stack-xs">
              <Text size="small" weight={status === 'current' ? 'semibold' : 'normal'}>{t(s['title'])}</Text>
              {vertical && s['description'] ? <Text size="small" className="mateu-st-muted">{t(s['description'])}</Text> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
