import React from 'react'
import { CheckCircleFillIcon, CheckIcon } from '@kit/icons'
import { type Dict, str } from '@mr/views/render/catalogue/status/common'
import { st } from '@app/i18n/st'

/**
 * SLDS override of views/render/catalogue/status/StepsTrack.tsx: a process's steps are the Path
 * blueprint (a row of chevron stages), and the vertical Progress Indicator when `vertical` —
 * SLDS's own stepper structures, each stage named complete / current / upcoming for a screen reader.
 */
export function StepsTrack({ steps, vertical, t }: { steps: Dict[]; vertical: boolean; t: (v: unknown) => string }) {
  const statusOf = (s: Dict) => str(s['status']) || 'upcoming'
  const word = (status: string) => (status === 'done' ? st('stepComplete') : status === 'current' ? st('stepCurrent') : st('stepUpcoming'))
  if (vertical) {
    return (
    <div className="slds-progress slds-progress_vertical">
      <ol className="slds-progress__list">
        {steps.map((s, i) => {
          const status = statusOf(s)
          return (
            <li key={str(s['id']) || i} className={'slds-progress__item' + (status === 'done' ? ' slds-is-completed' : status === 'current' ? ' slds-is-active' : '')}
              aria-current={status === 'current' ? 'step' : undefined}>
              {status === 'done'
                ? <span className="slds-icon_container slds-icon-utility-success slds-progress__marker slds-progress__marker_icon"><CheckCircleFillIcon size={12} className="slds-icon slds-icon_xx-small" /><span className="slds-assistive-text">{word(status)}</span></span>
                : <div className="slds-progress__marker"><span className="slds-assistive-text">{word(status)}</span></div>}
              <div className="slds-progress__item_content slds-grid slds-grid_align-spread">
                <span>
                  <span className={status === 'current' ? 'mateu-st-step-current' : undefined}>{t(s['title'])}</span>
                  {s['description'] ? <span className="slds-text-body_small slds-text-color_weak mateu-st-step-desc">{t(s['description'])}</span> : null}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
    )
  }
  return (
    <div className="slds-path">
      <div className="slds-grid slds-path__track">
        <div className="slds-grid slds-path__scroller-container">
          <div className="slds-path__scroller">
            <div className="slds-path__scroller_inner">
              <ol className="slds-path__nav">
                {steps.map((s, i) => {
                  const status = statusOf(s)
                  const cls = status === 'done' ? ' slds-is-complete' : status === 'current' ? ' slds-is-current slds-is-active' : ' slds-is-incomplete'
                  return (
                    <li key={str(s['id']) || i} className={'slds-path__item' + cls} aria-current={status === 'current' ? 'step' : undefined}>
                      <span className="slds-path__link mateu-path-link">
                        <span className="slds-path__stage">
                          <CheckIcon size={12} className="slds-icon slds-icon_x-small" />
                          <span className="slds-assistive-text">{word(status)}</span>
                        </span>
                        <span className="slds-path__title">{t(s['title'])}</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
