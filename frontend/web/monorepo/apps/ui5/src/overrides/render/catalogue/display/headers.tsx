import React from 'react'
import { Blankslate } from '@kit'
import { Breadcrumbs as Ui5Breadcrumbs, BreadcrumbsItem } from '@ui5/webcomponents-react'
import { Banner, Button, Heading, Label, Link, Stack, Text } from '@kit'
import { ArrowLeftIcon, SearchIcon } from '@kit'
import { heroToneColors } from '@rn/renderer/patternGaps'
import { ComponentRenderer } from '@mr/views/render/ComponentRenderer'
import { labelVariantOf } from '@mr/views/render/looks'
import type { CatalogueProps, Dict } from '@mr/views/render/catalogue/types'
import { childrenOf, list, safeHref, str, useOpenRoute, useRun, useText, WireIcon } from '@mr/views/render/catalogue/display/shared'
import { tx } from '@mr/i18n/texts'

/**
 * HeroSection: the welcome / landing band — overline, title, subtitle, the CTAs (its children);
 * on a background image (darkened so the ink reads) or a declared tone (the shared dark-band
 * palette every renderer uses), else UI5's subtle canvas.
 */
export function HeroSection({ component, metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const image = safeHref(text(metadata['image']))
  const tone = heroToneColors(str(metadata['tone']))
  const centered = metadata['centered'] !== false
  const onBand = !!image || !!tone
  const height = str(metadata['height'])
  const style: React.CSSProperties = {
    minHeight: height || '12rem',
    textAlign: centered ? 'center' : 'left',
    alignItems: centered ? 'center' : 'flex-start',
    backgroundColor: tone ? tone.background : undefined,
    backgroundImage: image ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url("${image.replace(/"/g, '%22')}")` : undefined,
  }
  const kids = childrenOf(component)
  return (
    <section className={`mateu-hero${onBand ? ' mateu-hero--band' : ''}`} style={style}>
      {metadata['overline'] ? <Text as="p" className="mateu-hero__overline">{text(metadata['overline'])}</Text> : null}
      {metadata['title'] ? <Heading as="h2" className="mateu-hero__title">{text(metadata['title'])}</Heading> : null}
      {metadata['subtitle'] ? <Text as="p" className="mateu-hero__subtitle">{text(metadata['subtitle'])}</Text> : null}
      {kids.length > 0 && (
        <Stack direction="horizontal" gap="condensed" wrap="wrap" justify={centered ? 'center' : 'start'} className="mateu-hero__ctas">
          {kids.map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
        </Stack>
      )}
    </section>
  )
}

/**
 * EntityHeader: a record's identity strip — title, badges, subtitle, its key facts (a fact with an
 * action is a link that runs it) and one headline metric on the right.
 */
export function EntityHeader({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const run = useRun()
  const facts = list(metadata['facts'])
  const badges = list(metadata['badges'])
  const metricValue = text(metadata['metricValue'])
  return (
    <header className="mateu-entity-header">
      <div className="mateu-entity-header__main">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Heading as="h2" className="mateu-entity-header__title">{text(metadata['title'])}</Heading>
          {badges.map((b, i) => <Label key={i} variant={labelVariantOf({ color: b['color'] })}>{text(b['label'])}</Label>)}
        </Stack>
        {metadata['subtitle'] ? <Text as="p" className="mateu-muted">{text(metadata['subtitle'])}</Text> : null}
        {facts.length > 0 && (
          <dl className="mateu-entity-header__facts">
            {facts.map((f, i) => (
              <div key={i}>
                <dt>{text(f['label'])}</dt>
                <dd>
                  {f['actionId']
                    ? <Link as="button" type="button" onClick={() => run(f['actionId'], (f['parameters'] as Dict | undefined) ?? undefined)} className="mateu-link-button">
                        {f['icon'] ? <WireIcon token={f['icon']} /> : null} {text(f['value'])}
                      </Link>
                    : <>{f['icon'] ? <WireIcon token={f['icon']} /> : null} {text(f['value'])}</>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {metricValue && (
        <div className="mateu-entity-header__metric">
          <Text as="div" size="small" className="mateu-muted">{text(metadata['metricLabel'])}</Text>
          <Text as="div" className="mateu-entity-header__metric-value">{metricValue}</Text>
          {metadata['metricCaption'] ? <Text as="div" size="small" className="mateu-muted">{text(metadata['metricCaption'])}</Text> : null}
        </div>
      )}
    </header>
  )
}

const BANNER_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'critical'> = {
  info: 'info', success: 'success', warning: 'warning', danger: 'critical', error: 'critical', critical: 'critical',
}

/** CalloutCard: a highlighted suggestion — UI5's Banner, its CTA as the primary action. */
export function CalloutCard({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const run = useRun()
  const variant = BANNER_VARIANT[str(metadata['theme']).toLowerCase()] ?? 'info'
  const cta = text(metadata['ctaLabel'])
  const icon = str(metadata['icon'])
  return (
    <Banner
      title={text(metadata['title']) || tx('toastInfo')}
      description={metadata['description'] ? text(metadata['description']) : undefined}
      variant={variant}
      leadingVisual={icon && (variant === 'info') ? <WireIcon token={icon} /> : undefined}
      primaryAction={cta && metadata['actionId'] ? <Banner.PrimaryAction onClick={() => run(metadata['actionId'])}>{cta}</Banner.PrimaryAction> : undefined}
      layout="default"
    />
  )
}

/** NotFound: UI5's blank slate, with the way back. */
export function NotFound({ metadata }: CatalogueProps) {
  const open = useOpenRoute()
  const back = str(metadata['backRoute'])
  return (
    <Blankslate border spacious>
      <Blankslate.Visual><SearchIcon size={24} /></Blankslate.Visual>
      <Blankslate.Heading as="h2">{str(metadata['title']) || tx('notFound')}</Blankslate.Heading>
      <Blankslate.Description>{str(metadata['message']) || tx('pageNotFoundMessage')}</Blankslate.Description>
      {back && (
        <Button leadingVisual={ArrowLeftIcon} onClick={() => open(back)}>{str(metadata['backLabel']) || tx('goBack')}</Button>
      )}
    </Blankslate>
  )
}

/** Breadcrumbs: UI5's, each crumb opening its route in the app; the current item last. */
export function Breadcrumbs({ metadata }: CatalogueProps) {
  const open = useOpenRoute()
  const crumbs = list(metadata['breadcrumbs'])
  const current = str(metadata['currentItemText'])
  return (
    <Ui5Breadcrumbs design={current ? 'Standard' : 'NoCurrentPage'}
      onItemClick={(e: CustomEvent<{ item: HTMLElement; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }>) => {
        const c = crumbs[Number(e.detail.item.getAttribute('data-index'))]
        if (!c) return
        const link = str(c['link'])
        if (e.detail.metaKey || e.detail.ctrlKey || e.detail.shiftKey || /^https?:/i.test(link)) return
        e.preventDefault()
        open(link, str(c['text']))
      }}>
      {crumbs.map((c, i) => <BreadcrumbsItem key={i} data-index={i} href={safeHref(str(c['link'])) ?? '#'}>{str(c['text'])}</BreadcrumbsItem>)}
      {current && <BreadcrumbsItem>{current}</BreadcrumbsItem>}
    </Ui5Breadcrumbs>
  )
}
