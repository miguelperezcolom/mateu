import React, { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';
import { AddOn, CalendarEvent, ChecklistItem, Chip, Comment, EmptyState, EntityHeader, Fact, FaqItem, Feature, FileItem, FoldoutPanelInfo, FunnelStage, GanttTask, HeatCell, HeroSection, KanbanColumn, LedgerLine, Meter, OfferCard, OrgNode, PaymentMethod, PricingPlan, ProcessItem, QueueGroup, ResourceItem, Skeleton, Stat, StatusItem, Step, Testimonial, TimelineItem } from '../api/metadata';
import { theme } from '../theme';

type Dict = Record<string, unknown>;
const meta = (c: unknown): Dict => ((c as Dict)?.['metadata'] as Dict) ?? {};
const childrenOf = (c: unknown): unknown[] => ((c as Dict)?.['children'] as unknown[]) ?? [];
const slotOf = (c: unknown): string => ((c as Dict)?.['slot'] as string) ?? '';

// Icons arrive as web icon tokens ("vaadin:chart") or emoji — only emoji/plain text render natively.
const displayIcon = (icon?: string): string => (icon && !icon.includes(':') ? icon : '');

// ── FoldoutLayout (mobile adaptation: overview card + accordion of panels) ───
export function FoldoutRenderer({ component, state }: { component: unknown; state: Dict }) {
  const panels = (meta(component)['panels'] as FoldoutPanelInfo[]) ?? [];
  const children = childrenOf(component);
  const overview = children.find((c) => slotOf(c) === 'overview');
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    panels.forEach((p, i) => { if (p.open) o[i] = true; });
    return o;
  });
  return (
    <View style={styles.foldout}>
      {!!overview && (
        <View style={styles.foldoutOverview}>
          <ComponentRenderer component={overview} state={state} />
        </View>
      )}
      {panels.map((p, i) => {
        const content = children.find((c) => slotOf(c) === `panel-${i}`);
        const icon = displayIcon(p.icon);
        return (
          <View key={i} style={styles.foldoutPanel}>
            <TouchableOpacity style={styles.foldoutHeader} onPress={() => setOpen({ ...open, [i]: !open[i] })}>
              <View style={styles.foldoutHeaderText}>
                <Text style={styles.foldoutTitle}>{icon ? `${icon} ` : ''}{p.title ?? ''}</Text>
                {!!p.subtitle && <Text style={styles.foldoutSubtitle}>{p.subtitle}</Text>}
              </View>
              <Text style={styles.foldoutChevron}>{open[i] ? '▾' : '▸'}</Text>
            </TouchableOpacity>
            {!!open[i] && !!content && (
              <View style={styles.foldoutBody}>
                <ComponentRenderer component={content} state={state} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────
const heroHeight = (height?: string): number => {
  if (!height) return 180;
  const value = parseFloat(height);
  if (isNaN(value)) return 180;
  if (height.includes('rem') || height.includes('em')) return value * 16;
  return value;
};

export function HeroSectionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component) as unknown as HeroSection;
  const children = childrenOf(component);
  const centered = m.centered !== false;
  const onImage = !!m.image;

  const content = (
    <View style={[styles.heroContent, { alignItems: centered ? 'center' : 'flex-start' }]}>
      {!!m.title && (
        <Text style={[styles.heroTitle, onImage && styles.heroTextOnImage, { textAlign: centered ? 'center' : 'left' }]}>
          {m.title}
        </Text>
      )}
      {!!m.subtitle && (
        <Text style={[styles.heroSubtitle, onImage && styles.heroTextOnImage, { textAlign: centered ? 'center' : 'left' }]}>
          {m.subtitle}
        </Text>
      )}
      {children.length > 0 && (
        <View style={[styles.heroCtas, { justifyContent: centered ? 'center' : 'flex-start' }]}>
          {children.map((child, i) => (
            <ComponentRenderer key={i} component={child} state={state} />
          ))}
        </View>
      )}
    </View>
  );

  if (m.image) {
    return (
      <ImageBackground source={{ uri: m.image }} style={[styles.hero, { minHeight: heroHeight(m.height) }]} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        {content}
      </ImageBackground>
    );
  }
  return <View style={[styles.hero, styles.heroPlain, { minHeight: heroHeight(m.height) }]}>{content}</View>;
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyStateRenderer({ metadata }: { metadata: EmptyState }) {
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);
  const actionId = metadata.actionId;
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{metadata.icon ?? '🗂'}</Text>
      {!!metadata.title && <Text style={styles.emptyTitle}>{metadata.title}</Text>}
      <Text style={styles.emptyDescription}>{metadata.description ?? 'Nothing here yet.'}</Text>
      {!!actionId && !!metadata.actionLabel && (
        <TouchableOpacity style={styles.emptyBtn} onPress={() => runAction(actionId)}>
          <Text style={styles.emptyBtnText}>{metadata.actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Skeleton (grey rounded placeholder blocks) ────────────────────────────────
export function SkeletonRenderer({ metadata }: { metadata: Skeleton }) {
  const variant = metadata.variant ?? 'text';
  const count = metadata.count && metadata.count > 0 ? metadata.count : 3;
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <View style={styles.skeleton}>
      {items.map((i) => {
        if (variant === 'card') return <View key={i} style={[styles.bone, styles.boneCard]} />;
        if (variant === 'grid') return <View key={i} style={[styles.bone, styles.boneRow]} />;
        if (variant === 'form') {
          return (
            <View key={i} style={styles.boneFormPair}>
              <View style={[styles.bone, styles.boneLabel]} />
              <View style={[styles.bone, styles.boneField]} />
            </View>
          );
        }
        return <View key={i} style={[styles.bone, styles.boneText, i === count - 1 && styles.boneTextLast]} />;
      })}
    </View>
  );
}

// ── Gantt (horizontal-scrollable timeline with proportional bars) ─────────────
const DAY_MS = 86400000;
const GANTT_ROW_H = 30;
const GANTT_HEADER_H = 22;

const parseDay = (s?: string): number | null => {
  if (!s) return null;
  const t = Date.parse(`${s}T00:00:00Z`);
  return isNaN(t) ? null : Math.floor(t / DAY_MS);
};

export function GanttRenderer({ component }: { component: unknown }) {
  const tasks = ((meta(component)['tasks'] as GanttTask[]) ?? []).filter(
    (t) => parseDay(t.start) != null && parseDay(t.end) != null,
  );
  if (tasks.length === 0) return <Text style={styles.ganttEmpty}>No tasks.</Text>;

  const minDay = Math.min(...tasks.map((t) => parseDay(t.start)!));
  const maxDay = Math.max(...tasks.map((t) => parseDay(t.end)!));
  const totalDays = Math.max(1, maxDay - minDay + 1);
  const dayW = Math.max(4, Math.min(16, Math.round(560 / totalDays)));
  const laneW = totalDays * dayW;
  const todayDay = Math.floor(Date.now() / DAY_MS);
  const todayX = todayDay >= minDay && todayDay <= maxDay ? (todayDay - minDay) * dayW : null;

  // Month tick labels along the header.
  const months: { label: string; left: number }[] = [];
  const cursor = new Date(minDay * DAY_MS);
  cursor.setUTCDate(1);
  while (Math.floor(cursor.getTime() / DAY_MS) <= maxDay) {
    const day = Math.floor(cursor.getTime() / DAY_MS);
    if (day >= minDay) {
      months.push({ label: cursor.toISOString().slice(0, 7), left: (day - minDay) * dayW });
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return (
    <View style={styles.gantt}>
      <View style={styles.ganttLabels}>
        <View style={{ height: GANTT_HEADER_H }} />
        {tasks.map((t, i) => (
          <View key={t.id ?? i} style={styles.ganttLabelRow}>
            <Text style={styles.ganttLabel} numberOfLines={1}>{t.title ?? t.id ?? ''}</Text>
          </View>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: laneW }}>
          <View style={styles.ganttHeader}>
            {months.map((mth, i) => (
              <Text key={i} style={[styles.ganttMonth, { left: mth.left }]}>{mth.label}</Text>
            ))}
          </View>
          <View>
            {tasks.map((t, i) => {
              const start = parseDay(t.start)!;
              const end = parseDay(t.end)!;
              const left = (start - minDay) * dayW;
              const width = Math.max(dayW, (end - start + 1) * dayW);
              const progress = Math.max(0, Math.min(100, t.progress ?? 0));
              return (
                <View key={t.id ?? i} style={styles.ganttRow}>
                  <View style={[styles.ganttBar, { left, width, backgroundColor: t.color ?? '#b3d1f0' }]}>
                    <View style={[styles.ganttProgress, { width: `${progress}%` }]} />
                  </View>
                </View>
              );
            })}
            {todayX != null && <View style={[styles.ganttToday, { left: todayX }]} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Kanban (horizontal scroll of columns, each a stack of cards) ──────────────
export function KanbanRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const columns = (meta(component)['columns'] as KanbanColumn[]) ?? [];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanBoard}>
      {columns.map((col, i) => (
        <View key={col.id ?? i} style={styles.kanbanColumn}>
          <View style={[styles.kanbanHead, { borderBottomColor: col.color ?? theme.border }]}>
            <Text style={styles.kanbanTitle} numberOfLines={1}>{col.title ?? ''}</Text>
            <Text style={styles.kanbanCount}>{col.cards?.length ?? 0}</Text>
          </View>
          {(col.cards ?? []).map((card, j) => {
            const body = (
              <View key={card.id ?? j} style={[styles.kanbanCard, { borderLeftColor: card.color ?? 'transparent' }]}>
                <Text style={styles.kanbanCardTitle}>{card.title ?? ''}</Text>
                {!!card.description && <Text style={styles.kanbanCardDesc}>{card.description}</Text>}
                {!!card.badge && <Text style={styles.kanbanBadge}>{card.badge}</Text>}
              </View>
            );
            return card.actionId ? (
              <TouchableOpacity key={card.id ?? j} onPress={() => void controller.runAction(card.actionId!)}>
                {body}
              </TouchableOpacity>
            ) : body;
          })}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Timeline (vertical rail of dots with title / timestamp / description) ─────
export function TimelineRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const items = (meta(component)['items'] as TimelineItem[]) ?? [];
  return (
    <View style={styles.timeline}>
      {items.map((it, i) => {
        const body = (
          <View style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, { backgroundColor: it.color ?? theme.primary }]}>
                <Text style={styles.timelineDotIcon}>{displayIcon(it.icon)}</Text>
              </View>
              {i < items.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineBody}>
              <View style={styles.timelineHead}>
                <Text style={styles.timelineTitle}>{it.title ?? ''}</Text>
                {!!it.timestamp && <Text style={styles.timelineTime}>{it.timestamp}</Text>}
              </View>
              {!!it.description && <Text style={styles.timelineDesc}>{it.description}</Text>}
            </View>
          </View>
        );
        return it.actionId ? (
          <TouchableOpacity key={it.id ?? i} onPress={() => void controller.runAction(it.actionId!)}>
            {body}
          </TouchableOpacity>
        ) : (
          <View key={it.id ?? i}>{body}</View>
        );
      })}
    </View>
  );
}

// ── ProgressSteps (mobile: a compact vertical stepper) ────────────────────────
export function ProgressStepsRenderer({ component }: { component: unknown }) {
  const steps = (meta(component)['steps'] as Step[]) ?? [];
  return (
    <View style={styles.steps}>
      {steps.map((s, i) => {
        const status = s.status ?? 'upcoming';
        const done = status === 'done';
        const current = status === 'current';
        const dotColor = done ? theme.primary : current ? theme.white : theme.border;
        return (
          <View key={s.id ?? i} style={styles.stepRow}>
            <View style={styles.stepRail}>
              <View style={[styles.stepDot, { backgroundColor: dotColor, borderColor: current ? theme.primary : 'transparent' }]}>
                <Text style={[styles.stepDotText, { color: done ? theme.white : current ? theme.primary : theme.muted }]}>{done ? '✓' : String(i + 1)}</Text>
              </View>
              {i < steps.length - 1 && <View style={[styles.stepLine, { backgroundColor: done ? theme.primary : theme.border }]} />}
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepTitle, status === 'upcoming' && styles.stepTitleMuted]}>{s.title ?? ''}</Text>
              {!!s.description && <Text style={styles.stepDesc}>{s.description}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Stat (KPI tile with a bar-sparkline) ──────────────────────────────────────
export function StatRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component) as unknown as Stat;
  const trend = m.trend ?? 'up';
  const trendColor = trend === 'down' ? theme.danger : trend === 'flat' ? theme.faint : theme.success;
  const spark = m.spark ?? [];
  const min = spark.length ? Math.min(...spark) : 0;
  const max = spark.length ? Math.max(...spark) : 1;
  const span = max - min || 1;
  const tile = (
    <View style={styles.statTile}>
      {!!m.label && <Text style={styles.statLabel}>{m.label}</Text>}
      <Text style={styles.statValue}>
        {m.value}
        {!!m.unit && <Text style={styles.statUnit}> {m.unit}</Text>}
      </Text>
      <View style={styles.statFoot}>
        {!!m.delta && (
          <Text style={[styles.statDelta, { color: trendColor }]}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '→'} {m.delta}
          </Text>
        )}
        <View style={styles.statSpark}>
          {spark.map((v, i) => (
            <View key={i} style={[styles.statBar, { height: 4 + 22 * ((v - min) / span), backgroundColor: trendColor }]} />
          ))}
        </View>
      </View>
    </View>
  );
  return m.actionId ? (
    <TouchableOpacity onPress={() => void controller.runAction(m.actionId!)}>{tile}</TouchableOpacity>
  ) : tile;
}

// ── Calendar (mobile: an agenda list of events grouped by day) ────────────────
export function CalendarRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const month = m['month'] as string | undefined;
  const events = ((m['events'] as CalendarEvent[]) ?? [])
    .filter((e) => !!e.date)
    .slice()
    .sort((a, b) => (a.date! < b.date! ? -1 : 1));
  const monthLabel = month
    ? new Date(month + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '';
  return (
    <View style={styles.agenda}>
      {!!monthLabel && <Text style={styles.agendaMonth}>{monthLabel}</Text>}
      {events.map((e, i) => {
        const day = e.date ? new Date(e.date + 'T00:00:00') : null;
        const row = (
          <View style={styles.agendaRow}>
            <View style={styles.agendaDate}>
              <Text style={styles.agendaDay}>{day ? day.getDate() : ''}</Text>
              <Text style={styles.agendaDow}>{day ? day.toLocaleDateString(undefined, { weekday: 'short' }) : ''}</Text>
            </View>
            <View style={[styles.agendaChip, { borderLeftColor: e.color ?? theme.primary }]}>
              <Text style={styles.agendaTitle}>{e.title ?? ''}</Text>
            </View>
          </View>
        );
        return e.actionId ? (
          <TouchableOpacity key={e.id ?? i} onPress={() => void controller.runAction(e.actionId!)}>{row}</TouchableOpacity>
        ) : (
          <View key={e.id ?? i}>{row}</View>
        );
      })}
    </View>
  );
}

// ── PricingTable (mobile: stacked plan cards) ─────────────────────────────────
export function PricingTableRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const plans = (meta(component)['plans'] as PricingPlan[]) ?? [];
  return (
    <View style={styles.pricing}>
      {plans.map((p, i) => (
        <View key={p.id ?? i} style={[styles.planCard, p.featured && styles.planCardFeatured]}>
          {p.featured && <Text style={styles.planBadge}>RECOMMENDED</Text>}
          <Text style={styles.planName}>{p.name ?? ''}</Text>
          <Text style={styles.planPrice}>
            {p.price}
            {!!p.period && <Text style={styles.planPeriod}> {p.period}</Text>}
          </Text>
          {(p.features ?? []).map((f, j) => (
            <Text key={j} style={styles.planFeature}>✓ {f}</Text>
          ))}
          {!!p.ctaLabel && (
            <TouchableOpacity
              style={[styles.planCta, p.featured && styles.planCtaFeatured]}
              onPress={() => p.actionId && void controller.runAction(p.actionId)}
            >
              <Text style={[styles.planCtaText, p.featured && styles.planCtaTextFeatured]}>{p.ctaLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

// ── OrgChart (mobile: an indented tree) ───────────────────────────────────────
function OrgNodeRow({ node, depth }: { node: OrgNode; depth: number }) {
  const controller = useViewController();
  const isImg = node.avatar && (node.avatar.startsWith('http') || node.avatar.startsWith('data:'));
  const row = (
    <View style={[styles.orgRow, { marginLeft: depth * 18, borderLeftColor: node.color ?? theme.primary }]}>
      {!!node.avatar && !isImg && <Text style={styles.orgAvatar}>{node.avatar}</Text>}
      <View>
        <Text style={styles.orgTitle}>{node.title ?? ''}</Text>
        {!!node.subtitle && <Text style={styles.orgSubtitle}>{node.subtitle}</Text>}
      </View>
    </View>
  );
  return (
    <>
      {node.actionId ? (
        <TouchableOpacity onPress={() => void controller.runAction(node.actionId!)}>{row}</TouchableOpacity>
      ) : row}
      {(node.children ?? []).map((c, i) => (
        <OrgNodeRow key={c.id ?? i} node={c} depth={depth + 1} />
      ))}
    </>
  );
}

export function OrgChartRenderer({ component }: { component: unknown }) {
  const root = meta(component)['root'] as OrgNode | undefined;
  if (!root) return null;
  return (
    <View style={styles.org}>
      <OrgNodeRow node={root} depth={0} />
    </View>
  );
}

// ── Heatmap (mobile: a wrapped grid of intensity squares) ─────────────────────
export function HeatmapRenderer({ component }: { component: unknown }) {
  const cells = ((meta(component)['cells'] as HeatCell[]) ?? []).filter((c) => !!c.date);
  const maxVal = Math.max(1, ...cells.map((c) => c.value ?? 0));
  const intensity = (v: number) => {
    if (v <= 0) return 'rgba(26,115,232,0.08)';
    const t = v / maxVal;
    const a = t > 0.75 ? 1 : t > 0.5 ? 0.75 : t > 0.25 ? 0.5 : 0.3;
    return `rgba(26,115,232,${a})`;
  };
  return (
    <View style={styles.heatWrap}>
      {cells.map((c, i) => (
        <View key={c.date ?? i} style={[styles.heatCell, { backgroundColor: intensity(c.value ?? 0) }]} />
      ))}
    </View>
  );
}

// ── Funnel (centered bars, each proportional to its value) ────────────────────
export function FunnelRenderer({ component }: { component: unknown }) {
  const stages = (meta(component)['stages'] as FunnelStage[]) ?? [];
  const maxVal = Math.max(1, ...stages.map((s) => s.value ?? 0));
  return (
    <View style={styles.funnel}>
      {stages.map((s, i) => {
        const value = s.value ?? 0;
        const prev = i > 0 ? stages[i - 1].value ?? 0 : value;
        const conv = i === 0 ? '' : prev > 0 ? `${Math.round((value / prev) * 100)}% of previous` : '';
        return (
          <View key={i} style={styles.funnelStage}>
            <View style={styles.funnelMeta}>
              <Text style={styles.funnelLabel}>{s.label ?? ''}</Text>
              {!!conv && <Text style={styles.funnelConv}>{conv}</Text>}
            </View>
            <View style={[styles.funnelBar, { width: `${Math.max(8, (value / maxVal) * 100)}%`, backgroundColor: s.color ?? theme.primary }]}>
              <Text style={styles.funnelValue}>{value.toLocaleString()}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── TrendChart (mobile: a compact bar chart of the series) ────────────────────
export function TrendChartRenderer({ component }: { component: unknown }) {
  const m = meta(component);
  const values = (m['values'] as number[]) ?? [];
  const labels = (m['labels'] as string[]) ?? [];
  const color = (m['color'] as string) ?? theme.primary;
  const title = m['title'] as string | undefined;
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  return (
    <View style={styles.trend}>
      {!!title && <Text style={styles.trendTitle}>{title}</Text>}
      <View style={styles.trendBars}>
        {values.map((v, i) => (
          <View key={i} style={[styles.trendBar, { height: 8 + 90 * ((v - min) / span), backgroundColor: color }]} />
        ))}
      </View>
      {labels.length > 0 && (
        <View style={styles.trendLabels}>
          <Text style={styles.trendLabel}>{labels[0]}</Text>
          <Text style={styles.trendLabel}>{labels[labels.length - 1]}</Text>
        </View>
      )}
    </View>
  );
}

// ── FeatureGrid (mobile: stacked feature cards) ───────────────────────────────
export function FeatureGridRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const features = (meta(component)['features'] as Feature[]) ?? [];
  return (
    <View style={styles.features}>
      {features.map((f, i) => {
        const card = (
          <View style={styles.featureCard}>
            {!!f.icon && <Text style={styles.featureIcon}>{f.icon.includes(':') ? '' : f.icon}</Text>}
            <Text style={styles.featureTitle}>{f.title ?? ''}</Text>
            {!!f.description && <Text style={styles.featureDesc}>{f.description}</Text>}
          </View>
        );
        return f.actionId ? (
          <TouchableOpacity key={i} onPress={() => void controller.runAction(f.actionId!)}>{card}</TouchableOpacity>
        ) : <View key={i}>{card}</View>;
      })}
    </View>
  );
}

// ── Testimonials (mobile: stacked quote cards) ────────────────────────────────
export function TestimonialsRenderer({ component }: { component: unknown }) {
  const items = (meta(component)['items'] as Testimonial[]) ?? [];
  const stars = (r: number) => '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(5 - Math.max(0, Math.min(5, r)));
  return (
    <View style={styles.testimonials}>
      {items.map((t, i) => (
        <View key={i} style={styles.testimonialCard}>
          {!!t.rating && <Text style={styles.testimonialStars}>{stars(t.rating)}</Text>}
          <Text style={styles.testimonialQuote}>“{t.quote}”</Text>
          <Text style={styles.testimonialAuthor}>
            {t.avatar && !t.avatar.includes(':') ? `${t.avatar} ` : ''}
            <Text style={{ fontWeight: '600' }}>{t.author}</Text>
            {t.role ? ` · ${t.role}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Faq (collapsible question/answer rows) ────────────────────────────────────
export function FaqRenderer({ component }: { component: unknown }) {
  const items = (meta(component)['items'] as FaqItem[]) ?? [];
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    items.forEach((it, i) => { if (it.open) o[i] = true; });
    return o;
  });
  return (
    <View style={styles.faq}>
      {items.map((it, i) => (
        <View key={i} style={styles.faqItem}>
          <TouchableOpacity style={styles.faqQ} onPress={() => setOpen({ ...open, [i]: !open[i] })}>
            <Text style={styles.faqQText}>{it.question ?? ''}</Text>
            <Text style={styles.faqChevron}>{open[i] ? '⌄' : '›'}</Text>
          </TouchableOpacity>
          {open[i] && <Text style={styles.faqA}>{it.answer ?? ''}</Text>}
        </View>
      ))}
    </View>
  );
}

// ── CalloutCard (themed call-to-action block) ─────────────────────────────────
export function CalloutCardRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const themeName = (m['theme'] as string) ?? 'info';
  const accent = themeName === 'success' ? theme.success : themeName === 'warning' ? theme.warning : themeName === 'danger' ? theme.danger : theme.primary;
  const bg = themeName === 'success' ? theme.successBg : themeName === 'warning' ? theme.warningBg : themeName === 'danger' ? theme.dangerBg : theme.infoBg;
  const icon = m['icon'] as string | undefined;
  const actionId = m['actionId'] as string | undefined;
  return (
    <View style={[styles.callout, { backgroundColor: bg, borderLeftColor: accent }]}>
      {!!icon && !icon.includes(':') && <Text style={styles.calloutIcon}>{icon}</Text>}
      <View style={styles.calloutBody}>
        {!!m['title'] && <Text style={styles.calloutTitle}>{m['title'] as string}</Text>}
        {!!m['description'] && <Text style={styles.calloutDesc}>{m['description'] as string}</Text>}
        {!!m['ctaLabel'] && (
          <TouchableOpacity style={[styles.calloutCta, { backgroundColor: accent }]} onPress={() => actionId && void controller.runAction(actionId)}>
            <Text style={styles.calloutCtaText}>{m['ctaLabel'] as string}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── CommentThread (nested indented comments) ──────────────────────────────────
function CommentNode({ comment, depth }: { comment: Comment; depth: number }) {
  return (
    <View style={[styles.commentNode, depth > 0 && { marginLeft: 14, borderLeftWidth: 2, borderLeftColor: theme.border, paddingLeft: 10 }]}>
      <View style={styles.commentRow}>
        <Text style={styles.commentAvatar}>{comment.avatar && !comment.avatar.includes(':') ? comment.avatar : (comment.author?.[0] ?? '?')}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentHead}>
            <Text style={{ fontWeight: '600', color: theme.ink }}>{comment.author}</Text>
            {comment.timestamp ? `  ${comment.timestamp}` : ''}
          </Text>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
      </View>
      {(comment.replies ?? []).map((r, i) => (
        <CommentNode key={r.id ?? i} comment={r} depth={depth + 1} />
      ))}
    </View>
  );
}

export function CommentThreadRenderer({ component }: { component: unknown }) {
  const comments = (meta(component)['comments'] as Comment[]) ?? [];
  return (
    <View style={styles.commentThread}>
      {comments.map((c, i) => <CommentNode key={c.id ?? i} comment={c} depth={0} />)}
    </View>
  );
}

// ── FileList (attachment rows with a type icon) ───────────────────────────────
const FILE_ICONS: Record<string, string> = {
  pdf: '📕', image: '🖼️', img: '🖼️', doc: '📘', docx: '📘', word: '📘',
  xls: '📗', xlsx: '📗', excel: '📗', zip: '🗜️', archive: '🗜️', video: '🎬', audio: '🎵', csv: '📄', txt: '📄',
};
export function FileListRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const files = (meta(component)['files'] as FileItem[]) ?? [];
  return (
    <View style={styles.fileList}>
      {files.map((f, i) => {
        const icon = (f.type && FILE_ICONS[f.type.toLowerCase()]) || '📄';
        const row = (
          <View style={styles.fileRow}>
            <Text style={styles.fileIcon}>{icon}</Text>
            <Text style={styles.fileName} numberOfLines={1}>{f.name ?? ''}</Text>
            {!!f.size && <Text style={styles.fileSize}>{f.size}</Text>}
          </View>
        );
        return f.actionId ? (
          <TouchableOpacity key={i} onPress={() => void controller.runAction(f.actionId!)}>{row}</TouchableOpacity>
        ) : <View key={i}>{row}</View>;
      })}
    </View>
  );
}

// ── Checklist (progress bar + toggleable items) ───────────────────────────────
export function ChecklistRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const title = m['title'] as string | undefined;
  const items = (m['items'] as ChecklistItem[]) ?? [];
  const [done, setDone] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    items.forEach((it, i) => { if (it.done) o[i] = true; });
    return o;
  });
  const total = items.length;
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const toggle = (it: ChecklistItem, i: number) => {
    const next = !done[i];
    setDone({ ...done, [i]: next });
    if (it.actionId) void controller.runAction(it.actionId);
  };
  return (
    <View style={styles.checklist}>
      <View style={styles.checkHead}>
        {!!title && <Text style={styles.checkTitle}>{title}</Text>}
        <Text style={styles.checkCount}>{doneCount} / {total}</Text>
      </View>
      <View style={styles.checkBar}><View style={[styles.checkFill, { width: `${pct}%` }]} /></View>
      {items.map((it, i) => (
        <TouchableOpacity key={it.id ?? i} style={styles.checkItem} onPress={() => toggle(it, i)}>
          <View style={[styles.checkBox, done[i] && styles.checkBoxDone]}>
            {done[i] && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={[styles.checkLabel, done[i] && styles.checkLabelDone]}>{it.label ?? ''}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Front-office UX components ────────────────────────────────────────────────

// Fixed 2-decimals + thousands-dot (de-DE style) amount formatter: 1234.5 → "1.234,50".
const fmtAmount = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${sign}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
};

// Badge palette (normal | success | warning | error | contrast), mirroring BadgeRenderer.
const PALETTE: Record<string, string> = {
  success: theme.success, warning: theme.warning, error: theme.danger, danger: theme.danger, contrast: theme.ink, normal: theme.muted,
};
const paletteColor = (c?: string): string => PALETTE[c ?? 'normal'] ?? theme.muted;

function ChipView({ chip }: { chip: Chip }) {
  return <Text style={[styles.uxChip, { backgroundColor: paletteColor(chip.color) }]}>{chip.label ?? ''}</Text>;
}

// ── EntityHeader (persistent context banner: identity + facts + metric) ───────
export function EntityHeaderRenderer({ component }: { component: unknown }) {
  const m = meta(component) as unknown as EntityHeader;
  const facts = m.facts ?? [];
  return (
    <View style={styles.entityHeader}>
      <View style={styles.entityLeft}>
        <View style={styles.entityTitleRow}>
          <Text style={styles.entityTitle}>{m.title ?? ''}</Text>
          {(m.badges ?? []).map((b, i) => <ChipView key={i} chip={b} />)}
        </View>
        {!!m.subtitle && <Text style={styles.entitySubtitle}>{m.subtitle}</Text>}
        {facts.length > 0 && (
          <View style={styles.entityFacts}>
            {facts.map((f: Fact, i) => (
              <View key={i} style={styles.entityFact}>
                <Text style={styles.entityFactLabel}>{f.label ?? ''}</Text>
                <Text style={styles.entityFactValue}>{f.value ?? ''}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {!!m.metricValue && (
        <View style={styles.entityMetric}>
          {!!m.metricLabel && <Text style={styles.entityFactLabel}>{m.metricLabel}</Text>}
          <Text style={styles.entityMetricValue}>{m.metricValue}</Text>
          {!!m.metricCaption && <Text style={styles.entityMetricCaption}>{m.metricCaption}</Text>}
        </View>
      )}
    </View>
  );
}

// ── Meter (consumption vs limit with warn/danger thresholds) ──────────────────
export function MeterRenderer({ component }: { component: unknown }) {
  const m = meta(component) as unknown as Meter;
  const value = m.value ?? 0;
  const max = m.max ?? 0;
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const fill = m.dangerAt != null && value >= m.dangerAt ? PALETTE.error
    : m.warnAt != null && value >= m.warnAt ? PALETTE.warning
    : m.warnAt != null || m.dangerAt != null ? PALETTE.success : theme.primary;
  const caption = m.caption || `${Math.round(ratio * 100)}%`;
  return (
    <View style={styles.meter}>
      {!!m.label && <Text style={styles.meterLabel}>{m.label}</Text>}
      <Text style={styles.meterValue}>{fmtAmount(value)}{m.unit ? ` ${m.unit}` : ''}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${ratio * 100}%`, backgroundColor: fill }]} />
      </View>
      <Text style={styles.meterCaption}>{caption}</Text>
    </View>
  );
}

// ── TaskProgress (subtask completion banner with pills + CTA) ─────────────────
export function TaskProgressRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const total = (m['total'] as number) ?? 0;
  const done = (m['done'] as number) ?? 0;
  const complete = total > 0 && done >= total;
  const actionId = m['actionId'] as string | undefined;
  const actionLabel = m['actionLabel'] as string | undefined;
  return (
    <View style={[styles.taskProgress, { backgroundColor: complete ? 'rgba(18,183,106,0.1)' : 'rgba(245,158,11,0.12)' }]}>
      <Text style={styles.taskProgressIcon}>👥</Text>
      <Text style={styles.taskProgressLabel}>{(m['label'] as string) ?? ''}</Text>
      <View style={styles.taskProgressPills}>
        {Array.from({ length: total }, (_, i) => i + 1).map((i) => (
          <Text key={i} style={[styles.taskProgressPill, i <= done ? styles.taskProgressPillDone : styles.taskProgressPillTodo]}>
            {i}/{total}
          </Text>
        ))}
      </View>
      {!complete && !!actionId && !!actionLabel && (
        <TouchableOpacity style={styles.taskProgressBtn} onPress={() => void controller.runAction(actionId)}>
          <Text style={styles.taskProgressBtnText}>{actionLabel} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── StatusList (icon + title/description rows with status chip and/or action) ─
export function StatusListRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const items = (meta(component)['items'] as StatusItem[]) ?? [];
  const compact = !!meta(component)['compact'];
  const frameless = !!meta(component)['frameless'];
  const rowActionId = meta(component)['rowActionId'] as string | undefined;
  const Row = rowActionId ? TouchableOpacity : View;
  return (
    <View style={[styles.statusList, frameless && styles.statusListFrameless]}>
      {items.map((it, i) => (
        <Row
          key={it.id ?? i}
          style={[styles.statusRow, compact && styles.statusRowCompact]}
          {...(rowActionId ? { onPress: () => void controller.runAction(rowActionId, { _item: it.id }) } : {})}>
          {it.avatar
            ? <View style={[styles.statusAvatar, compact && styles.statusAvatarCompact]}><Text style={styles.statusAvatarText}>{it.avatar}</Text></View>
            : !!it.icon && <Text style={styles.statusIcon}>{displayIcon(it.icon)}</Text>}
          <View style={styles.statusBody}>
            <Text style={styles.statusTitle}>{it.title ?? ''}</Text>
            {!!it.description && <Text style={styles.statusDesc}>{it.description}</Text>}
          </View>
          {!!it.status && <ChipView chip={{ label: it.status, color: it.statusColor }} />}
          {!!it.actionLabel && !!it.actionId && (
            <TouchableOpacity style={styles.statusBtn} onPress={() => void controller.runAction(it.actionId!, { _item: it.id })}>
              <Text style={styles.statusBtnText}>{it.actionLabel}</Text>
            </TouchableOpacity>
          )}
        </Row>
      ))}
    </View>
  );
}

// ── Notice (compact inline banner: tinted strip + severity icon + one line) ───
const NOTICE_COLORS: Record<string, { bg: string; ink: string; badge: string }> = {
  info: { bg: theme.infoBg, ink: theme.info, badge: theme.info },
  success: { bg: theme.successBg, ink: theme.success, badge: theme.success },
  warning: { bg: theme.warningBg, ink: theme.warning, badge: theme.warning },
  danger: { bg: theme.dangerBg, ink: theme.danger, badge: theme.danger },
};
const NOTICE_ICONS: Record<string, string> = { info: 'ℹ', success: '✓', warning: '!', danger: '!' };

export function NoticeRenderer({ component, state, renderComponent }: {
  component: unknown;
  state?: Record<string, unknown>;
  renderComponent?: (child: unknown, state: Record<string, unknown>, onStateChange: () => void) => unknown;
}) {
  const controller = useViewController();
  const m = meta(component);
  const themeName = (['info', 'success', 'warning', 'danger'].includes(m['theme'] as string)
    ? m['theme'] : 'info') as string;
  const colors = NOTICE_COLORS[themeName];
  const actionLabel = m['actionLabel'] as string | undefined;
  const actionId = m['actionId'] as string | undefined;
  const status = m['status'] as string | undefined;
  const noIcon = m['noIcon'] === true;
  const slim = m['slim'] === true;
  const children = ((component as Record<string, unknown>)['children'] as unknown[]) ?? [];
  const hasText = !!((m['text'] as string) ?? '').trim();
  if (!hasText && children.length === 0) return null;
  return (
    <View style={[styles.notice, slim && styles.noticeSlim, { backgroundColor: colors.bg }]}>
      {!noIcon && (
        <View style={[styles.noticeIcon, { backgroundColor: colors.badge }]}>
          <Text style={styles.noticeIconText}>{(m['icon'] as string) || NOTICE_ICONS[themeName]}</Text>
        </View>
      )}
      <View style={[styles.noticeBody, m['inlineContent'] === true && styles.noticeBodyInline]}>
        {hasText && <Text style={[styles.noticeText, { color: colors.ink }]}>{(m['text'] as string) ?? ''}</Text>}
        {children.map((child, i) => (
          <View key={i}>{renderComponent?.(child, state ?? {}, () => {}) as React.ReactNode}</View>
        ))}
      </View>
      {!!actionLabel && !!actionId ? (
        <TouchableOpacity
          style={[styles.noticeBtn, { backgroundColor: colors.badge }]}
          onPress={() => void controller.runAction(actionId)}>
          <Text style={styles.noticeBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : status ? (
        <Text style={{ color: colors.ink, fontWeight: '600', fontSize: 12 }}>{status}</Text>
      ) : null}
    </View>
  );
}

// ── BulletedList (plain <ul> of text items — StatusList's lightweight sibling) ─
export function BulletedListRenderer({ component }: { component: unknown }) {
  const items = (meta(component)['items'] as string[]) ?? [];
  return (
    <View style={styles.bulletedList}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletedRow}>
          <Text style={styles.bulletedDot}>•</Text>
          <Text style={styles.bulletedText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ── ComparisonCard (two values + delta chip) ──────────────────────────────────
export function ComparisonCardRenderer({ component }: { component: unknown }) {
  const m = meta(component);
  const title = m['title'] as string | undefined;
  const trend = (m['trend'] as string | undefined) ?? 'flat';
  const delta = m['delta'] as string | undefined;
  const deltaColor = trend === 'up' ? theme.success : trend === 'down' ? theme.danger : theme.faint;
  const deltaBg = trend === 'up' ? 'rgba(18,183,106,.12)' : trend === 'down' ? 'rgba(225,29,72,.12)' : 'rgba(0,0,0,.06)';
  const mark = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';
  return (
    <View style={styles.cmpCard}>
      {!!title && <Text style={styles.cmpTitle}>{title}</Text>}
      <View style={styles.cmpRow}>
        <View style={styles.cmpSide}>
          {!!m['leftLabel'] && <Text style={styles.cmpLabel}>{m['leftLabel'] as string}</Text>}
          <Text style={styles.cmpValue}>{(m['leftValue'] as string) ?? ''}</Text>
        </View>
        <View style={styles.cmpMid}>
          <Text style={styles.cmpArrow}>→</Text>
          {!!delta && (
            <Text style={[styles.cmpDelta, { color: deltaColor, backgroundColor: deltaBg }]}>{mark} {delta}</Text>
          )}
        </View>
        <View style={styles.cmpSide}>
          {!!m['rightLabel'] && <Text style={styles.cmpLabel}>{m['rightLabel'] as string}</Text>}
          <Text style={styles.cmpValue}>{(m['rightValue'] as string) ?? ''}</Text>
        </View>
      </View>
    </View>
  );
}

// ── TaskQueue (grouped work-queue rail of selectable cards) ───────────────────
export function TaskQueueRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const actionId = m['actionId'] as string | undefined;
  const groups = (m['groups'] as QueueGroup[]) ?? [];
  const [selected, setSelected] = useState<string | undefined>(
    () => groups.flatMap((g) => g.items ?? []).find((it) => it.selected)?.id,
  );
  return (
    <View style={styles.taskQueue}>
      {groups.map((g, gi) => (
        <View key={gi} style={styles.taskQueueGroup}>
          {!!g.label && <Text style={styles.taskQueueGroupLabel}>{g.label.toUpperCase()}</Text>}
          {(g.items ?? []).map((it, i) => {
            const sel = it.id === selected;
            return (
              <TouchableOpacity
                key={it.id ?? i}
                style={[styles.queueCard, sel && styles.queueCardSelected]}
                onPress={() => {
                  setSelected(it.id);
                  if (actionId) void controller.runAction(actionId, { _item: it.id });
                }}
              >
                <Text style={styles.queueCardTitle}>{it.title ?? ''}</Text>
                <View style={styles.queueCardFoot}>
                  {!!it.caption && <Text style={styles.queueCardCaption}>{it.caption}</Text>}
                  {(it.badges ?? []).map((b, j) => <ChipView key={j} chip={b} />)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── ResourceGrid (availability/selection grid, e.g. room picker) ──────────────
export function ResourceGridRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const actionId = m['actionId'] as string | undefined;
  const columns = (m['columns'] as number) ?? 0;
  const recommendedLabel = (m['recommendedLabel'] as string) ?? 'Recommended';
  const items = (m['items'] as ResourceItem[]) ?? [];
  const [selected, setSelected] = useState<string | undefined>(() => items.find((it) => it.selected)?.id);
  const cardWidth = columns > 0 ? `${100 / columns}%` as const : '33.333%' as const;
  return (
    <View style={styles.resourceGrid}>
      {items.map((it, i) => {
        const sel = it.id === selected;
        const card = (
          <View style={[styles.resourceCard, (sel || it.recommended) && styles.resourceCardAccent, sel && styles.resourceCardSelected, it.disabled && styles.resourceCardDisabled]}>
            {it.recommended && <Text style={styles.resourceTag}>{recommendedLabel}</Text>}
            <Text style={styles.resourceTitle}>{it.title ?? ''}</Text>
            {!!it.subtitle && <Text style={styles.resourceSubtitle}>{it.subtitle}</Text>}
            {!!it.statusLabel && <ChipView chip={{ label: it.statusLabel, color: it.statusColor }} />}
            {!!it.note && (
              <Text style={[styles.resourceNote, { color: paletteColor(it.noteColor) }]}>● {it.note}</Text>
            )}
          </View>
        );
        return (
          <View key={it.id ?? i} style={{ width: cardWidth, padding: 4 }}>
            {it.disabled ? card : (
              <TouchableOpacity
                onPress={() => {
                  setSelected(it.id);
                  if (actionId) void controller.runAction(actionId, { _item: it.id });
                }}
              >
                {card}
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── OfferCard (current vs upgrade offer) ──────────────────────────────────────
export function OfferCardRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component) as unknown as OfferCard;
  const current = m.current === true;
  return (
    <View style={[styles.offerCard, !current && styles.offerCardAccent]}>
      {!!m.image && (
        <View>
          <Image source={{ uri: m.image }} style={styles.offerImage} resizeMode="cover" />
          {!!m.tag && <Text style={[styles.offerTag, styles.offerTagFloating]}>{m.tag}</Text>}
        </View>
      )}
      <View style={styles.offerBody}>
        {!m.image && !!m.tag && <Text style={styles.offerTag}>{m.tag}</Text>}
        <Text style={styles.offerTitle}>{m.title ?? ''}</Text>
        {!!m.subtitle && <Text style={styles.offerSubtitle}>{m.subtitle}</Text>}
        {(m.features ?? []).length > 0 && (
          <View style={styles.offerFeatures}>
            {(m.features ?? []).map((f, i) => <Text key={i} style={styles.offerFeature}>{f}</Text>)}
          </View>
        )}
        {current ? (
          !!m.currentLabel && <Text style={styles.offerCurrentLabel}>{m.currentLabel}</Text>
        ) : (
          !!m.actionLabel && (
            <TouchableOpacity
              style={[styles.offerCta, m.added === true && styles.offerCtaAdded]}
              onPress={() => m.actionId && void controller.runAction(m.actionId)}
            >
              <Text style={styles.offerCtaText}>{m.added === true ? (m.addedLabel ?? m.actionLabel) : m.actionLabel}</Text>
              {!!m.priceLabel && <Text style={styles.offerCtaPrice}>{m.priceLabel}</Text>}
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

// ── AddOnPicker (priced extras with running total) ────────────────────────────
export function AddOnPickerRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const items = (m['items'] as AddOn[]) ?? [];
  const currency = (m['currency'] as string) ?? '';
  const totalLabel = (m['totalLabel'] as string) ?? '';
  const actionId = m['actionId'] as string | undefined;
  const [added, setAdded] = useState<Set<string>>(
    () => new Set(items.filter((it) => it.added).map((it) => it.id ?? '')),
  );
  const totalOf = (set: Set<string>) =>
    items.filter((it) => set.has(it.id ?? '')).reduce((sum, it) => sum + (it.price ?? 0), 0);
  const toggle = (it: AddOn) => {
    const id = it.id ?? '';
    const next = new Set(added);
    const nowAdded = !next.has(id);
    if (nowAdded) next.add(id); else next.delete(id);
    setAdded(next);
    if (actionId) void controller.runAction(actionId, { _item: id, _added: nowAdded, _total: totalOf(next) });
  };
  return (
    <View style={styles.addOnPicker}>
      <View style={styles.addOnHead}>
        <Text style={styles.addOnTotal}>
          {totalLabel ? `${totalLabel}: ` : ''}{currency ? `${currency} ` : ''}{fmtAmount(totalOf(added))}
        </Text>
      </View>
      <View style={styles.addOnGrid}>
        {items.map((it, i) => {
          const isAdded = added.has(it.id ?? '');
          return (
            <View key={it.id ?? i} style={styles.addOnCard}>
              <View style={styles.addOnCardHead}>
                {!!it.icon && <Text style={styles.addOnIcon}>{displayIcon(it.icon)}</Text>}
                <View style={{ flex: 1 }}>
                  <Text style={styles.addOnTitle}>{it.title ?? ''}</Text>
                  {!!it.description && <Text style={styles.addOnDesc}>{it.description}</Text>}
                </View>
                {!it.includedLabel && (
                  <TouchableOpacity
                    style={[styles.addOnToggle, isAdded && styles.addOnToggleAdded]}
                    onPress={() => toggle(it)}
                  >
                    <Text style={[styles.addOnToggleText, isAdded && styles.addOnToggleTextAdded]}>{isAdded ? '✓' : '+'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {it.includedLabel ? (
                <Text style={styles.addOnIncluded}>{it.includedLabel}</Text>
              ) : (
                <Text style={styles.addOnPrice}>
                  {currency ? `${currency} ` : ''}{fmtAmount(it.price ?? 0)}{it.unit ? ` / ${it.unit}` : ''}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Ledger (folio breakdown with total) ───────────────────────────────────────
const ledgerAmount = (amount: number, currency: string): string =>
  `${amount < 0 ? '-' : ''}${currency ? `${currency} ` : ''}${fmtAmount(Math.abs(amount))}`;

export function LedgerRenderer({ component }: { component: unknown }) {
  const m = meta(component);
  const lines = (m['lines'] as LedgerLine[]) ?? [];
  const currency = (m['currency'] as string) ?? '';
  const totalLabel = (m['totalLabel'] as string) ?? 'Total';
  const total = (m['total'] as number | undefined)
    ?? lines.filter((l) => !l.included).reduce((sum, l) => sum + (l.amount ?? 0), 0);
  return (
    <View style={styles.ledger}>
      {lines.map((l, i) => (
        <View key={i} style={styles.ledgerRow}>
          <Text style={styles.ledgerConcept}>● {l.concept ?? ''}</Text>
          {l.included ? (
            <Text style={styles.ledgerIncluded}>{l.includedLabel ?? 'Included'}</Text>
          ) : (
            <Text style={[styles.ledgerAmount, (l.amount ?? 0) < 0 && styles.ledgerAmountNegative]}>
              {ledgerAmount(l.amount ?? 0, currency)}
            </Text>
          )}
        </View>
      ))}
      <View style={styles.ledgerDivider} />
      <View style={styles.ledgerRow}>
        <Text style={styles.ledgerTotalLabel}>{totalLabel}</Text>
        <Text style={styles.ledgerTotal}>{ledgerAmount(total, currency)}</Text>
      </View>
    </View>
  );
}

// ── PaymentPicker (payment method + context + confirm CTA) ────────────────────
export function PaymentPickerRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const methods = (m['methods'] as PaymentMethod[]) ?? [];
  const actionId = m['actionId'] as string | undefined;
  const methodActionId = m['methodActionId'] as string | undefined;
  const [selected, setSelected] = useState<string | undefined>(() => (m['selected'] as string) || methods[0]?.id);
  return (
    <View style={styles.paymentPicker}>
      <View style={styles.paymentMethods}>
        {methods.map((pm, i) => {
          const sel = pm.id === selected;
          return (
            <TouchableOpacity
              key={pm.id ?? i}
              style={[styles.paymentMethod, sel && styles.paymentMethodSelected]}
              onPress={() => {
                setSelected(pm.id);
                if (methodActionId) void controller.runAction(methodActionId, { _method: pm.id });
              }}
            >
              <Text style={[styles.paymentMethodText, sel && styles.paymentMethodTextSelected]}>{pm.label ?? ''}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!!m['contextValue'] && (
        <View style={styles.paymentContext}>
          {!!m['contextLabel'] && <Text style={styles.paymentContextLabel}>{m['contextLabel'] as string}</Text>}
          <Text style={styles.paymentContextValue}>{m['contextValue'] as string}</Text>
        </View>
      )}
      {!!m['confirmLabel'] && (
        <TouchableOpacity
          style={styles.paymentConfirm}
          onPress={() => actionId && void controller.runAction(actionId, { _method: selected })}
        >
          <Text style={styles.paymentConfirmText}>{m['confirmLabel'] as string}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── ProcessMonitor (automation processes with health counters + fix action) ───
export function ProcessMonitorRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const items = (meta(component)['items'] as ProcessItem[]) ?? [];
  const dotColor = (status?: string) =>
    status === 'error' ? PALETTE.error : status === 'warning' ? PALETTE.warning : PALETTE.success;
  return (
    <View style={styles.processMonitor}>
      {items.map((it, i) => (
        <View key={it.id ?? i} style={styles.processRow}>
          <Text style={[styles.processDot, { color: dotColor(it.status) }]}>●</Text>
          <View style={styles.processBody}>
            <Text style={styles.processName}>{it.name ?? ''}</Text>
            {(it.systems ?? []).length > 0 && (
              <Text style={styles.processSystems}>{(it.systems ?? []).join(' · ')}</Text>
            )}
          </View>
          <View style={styles.processCounters}>
            <Text style={[styles.processCounter, { color: PALETTE.success }]}>✓ {it.ok ?? 0} OK</Text>
            {(it.warnings ?? 0) > 0 && (
              <Text style={[styles.processCounter, { color: PALETTE.warning }]}>⚠ {it.warnings} warnings</Text>
            )}
            {(it.errors ?? 0) > 0 && (
              <Text style={[styles.processCounter, { color: PALETTE.error }]}>⛔ {it.errors} errors</Text>
            )}
          </View>
          {!!it.actionLabel && !!it.actionId && (
            <TouchableOpacity style={styles.processBtn} onPress={() => void controller.runAction(it.actionId!)}>
              <Text style={styles.processBtnText}>{it.actionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Foldout
  foldout: { gap: 12 },
  foldoutOverview: { backgroundColor: theme.white, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 16 },
  foldoutPanel: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, overflow: 'hidden' },
  foldoutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: theme.background },
  foldoutHeaderText: { flex: 1, gap: 2 },
  foldoutTitle: { fontWeight: '700' },
  foldoutSubtitle: { fontSize: 12, color: theme.muted },
  foldoutChevron: { color: theme.muted, marginLeft: 8 },
  foldoutBody: { padding: 12, backgroundColor: theme.white },
  // Hero
  hero: { borderRadius: 12, overflow: 'hidden', justifyContent: 'center' },
  heroPlain: { backgroundColor: theme.background },
  heroImage: { borderRadius: 12 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroContent: { padding: 24, gap: 8 },
  heroTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34, color: theme.ink },
  heroSubtitle: { fontSize: 16, color: theme.muted },
  heroTextOnImage: { color: theme.white },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  // EmptyState
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  emptyIcon: { fontSize: 30, opacity: 0.6 },
  emptyTitle: { fontWeight: '600', color: theme.ink },
  emptyDescription: { fontSize: 13, color: theme.muted, textAlign: 'center' },
  emptyBtn: { marginTop: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radiusSm, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border },
  emptyBtnText: { color: theme.primary, fontSize: 14 },
  // Skeleton
  skeleton: { gap: 8, flex: 1 },
  bone: { backgroundColor: theme.divider, borderRadius: theme.radiusSm },
  boneText: { height: 12, alignSelf: 'stretch' },
  boneTextLast: { width: '60%', alignSelf: 'flex-start' },
  boneCard: { height: 90, alignSelf: 'stretch' },
  boneRow: { height: 36, alignSelf: 'stretch' },
  boneFormPair: { gap: 4 },
  boneLabel: { height: 10, width: '35%' },
  boneField: { height: 32, alignSelf: 'stretch' },
  // Gantt
  gantt: { flexDirection: 'row', borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 8, backgroundColor: theme.white },
  ganttLabels: { width: 110, marginRight: 8 },
  ganttLabelRow: { height: GANTT_ROW_H, justifyContent: 'center' },
  ganttLabel: { fontSize: 12, color: theme.ink },
  ganttHeader: { height: GANTT_HEADER_H },
  ganttMonth: { position: 'absolute', top: 2, fontSize: 10, color: theme.faint },
  ganttRow: { height: GANTT_ROW_H, justifyContent: 'center' },
  ganttBar: { position: 'absolute', height: 18, borderRadius: 4, overflow: 'hidden', justifyContent: 'center' },
  ganttProgress: { height: '100%', backgroundColor: 'rgba(0,0,0,0.25)' },
  ganttToday: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: theme.danger },
  ganttEmpty: { fontSize: 12, color: theme.faint, fontStyle: 'italic' },
  // Kanban
  kanbanBoard: { gap: 12, paddingBottom: 4 },
  kanbanColumn: { width: 220, gap: 8, backgroundColor: theme.background, borderRadius: 12, padding: 10 },
  kanbanHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 6, borderBottomWidth: 2 },
  kanbanTitle: { fontWeight: '600', flex: 1, color: theme.ink },
  kanbanCount: { fontSize: 12, color: theme.muted, backgroundColor: theme.border, borderRadius: 999, paddingHorizontal: 8, overflow: 'hidden' },
  kanbanCard: { backgroundColor: theme.white, borderColor: theme.border, borderWidth: 1, borderLeftWidth: 3, borderRadius: 8, padding: 10, gap: 4 },
  kanbanCardTitle: { fontWeight: '600', color: theme.ink },
  kanbanCardDesc: { fontSize: 12, color: theme.muted },
  kanbanBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', color: theme.primary, backgroundColor: 'rgba(26,115,232,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
  // Timeline
  timeline: {},
  timelineRow: { flexDirection: 'row', gap: 10 },
  timelineRail: { alignItems: 'center', width: 26 },
  timelineDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  timelineDotIcon: { fontSize: 12, color: theme.white },
  timelineLine: { flex: 1, width: 2, backgroundColor: theme.border, marginVertical: 2, minHeight: 8 },
  timelineBody: { flex: 1, paddingBottom: 16 },
  timelineHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  timelineTitle: { fontWeight: '600', color: theme.ink },
  timelineTime: { fontSize: 11, color: theme.faint },
  timelineDesc: { color: theme.muted, marginTop: 2 },
  // ProgressSteps (vertical on mobile)
  steps: {},
  stepRow: { flexDirection: 'row', gap: 10 },
  stepRail: { alignItems: 'center', width: 32 },
  stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepDotText: { fontWeight: '700', fontSize: 13 },
  stepLine: { flex: 1, width: 2, marginVertical: 2, minHeight: 10 },
  stepBody: { flex: 1, paddingBottom: 18, paddingTop: 4 },
  stepTitle: { fontWeight: '600', color: theme.ink },
  stepTitleMuted: { color: theme.faint, fontWeight: '500' },
  stepDesc: { color: theme.faint, fontSize: 12, marginTop: 2 },
  // Stat
  statTile: { padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.white, gap: 2, minWidth: 150 },
  statLabel: { fontSize: 12, color: theme.muted },
  statValue: { fontSize: 28, fontWeight: '700', color: theme.ink },
  statUnit: { fontSize: 15, fontWeight: '500', color: theme.faint },
  statFoot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4, gap: 8 },
  statDelta: { fontSize: 12, fontWeight: '600' },
  statSpark: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 26 },
  statBar: { width: 4, borderRadius: 1 },
  // Calendar (agenda)
  agenda: { gap: 8 },
  agendaMonth: { fontWeight: '700', fontSize: 16, color: theme.ink, marginBottom: 4 },
  agendaRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  agendaDate: { width: 44, alignItems: 'center' },
  agendaDay: { fontWeight: '700', fontSize: 18, color: theme.ink },
  agendaDow: { fontSize: 11, color: theme.faint, textTransform: 'uppercase' },
  agendaChip: { flex: 1, borderLeftWidth: 3, backgroundColor: theme.background, borderRadius: theme.radiusSm, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
  agendaTitle: { fontWeight: '600', color: theme.ink },
  // PricingTable
  pricing: { gap: 12 },
  planCard: { padding: 18, borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: theme.white, gap: 6 },
  planCardFeatured: { borderColor: theme.primary, borderWidth: 2 },
  planBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '700', color: theme.white, backgroundColor: theme.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  planName: { fontWeight: '600', color: theme.muted },
  planPrice: { fontSize: 30, fontWeight: '800', color: theme.ink },
  planPeriod: { fontSize: 14, fontWeight: '500', color: theme.faint },
  planFeature: { color: theme.ink, fontSize: 14 },
  planCta: { marginTop: 6, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.divider },
  planCtaFeatured: { backgroundColor: theme.primary },
  planCtaText: { fontWeight: '600', color: theme.ink },
  planCtaTextFeatured: { color: theme.white },
  // OrgChart (indented tree)
  org: { gap: 6 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 6, backgroundColor: theme.background, borderRadius: theme.radiusSm },
  orgAvatar: { fontSize: 18 },
  orgTitle: { fontWeight: '600', color: theme.ink },
  orgSubtitle: { fontSize: 12, color: theme.faint },
  // Heatmap
  heatWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  heatCell: { width: 12, height: 12, borderRadius: 2 },
  // Funnel
  funnel: { gap: 6, alignItems: 'center' },
  funnelStage: { alignItems: 'center', width: '100%' },
  funnelMeta: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  funnelLabel: { fontWeight: '600', color: theme.ink },
  funnelConv: { fontSize: 11, color: theme.faint },
  funnelBar: { height: 34, borderRadius: theme.radiusSm, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  funnelValue: { color: theme.white, fontWeight: '700' },
  // TrendChart
  trend: { gap: 4 },
  trendTitle: { fontWeight: '600', color: theme.ink },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 100 },
  trendBar: { flex: 1, borderRadius: 2, minWidth: 4 },
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  trendLabel: { fontSize: 11, color: theme.faint },
  // FeatureGrid
  features: { gap: 10 },
  featureCard: { padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.white, gap: 4 },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontWeight: '700', color: theme.ink },
  featureDesc: { color: theme.muted, fontSize: 13 },
  // Testimonials
  testimonials: { gap: 10 },
  testimonialCard: { padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.white, gap: 6 },
  testimonialStars: { color: theme.warning, letterSpacing: 1 },
  testimonialQuote: { fontStyle: 'italic', color: theme.ink, lineHeight: 20 },
  testimonialAuthor: { color: theme.muted, fontSize: 13 },
  // Faq
  faq: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, overflow: 'hidden' },
  faqItem: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  faqQ: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  faqQText: { fontWeight: '600', color: theme.ink, flex: 1 },
  faqChevron: { color: theme.faint, fontSize: 16 },
  faqA: { paddingHorizontal: 14, paddingBottom: 14, color: theme.muted, lineHeight: 20 },
  // CalloutCard
  callout: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14, borderLeftWidth: 4 },
  calloutIcon: { fontSize: 24 },
  calloutBody: { flex: 1, gap: 4 },
  calloutTitle: { fontWeight: '700', fontSize: 16, color: theme.ink },
  calloutDesc: { color: theme.muted, lineHeight: 20 },
  calloutCta: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 16 },
  calloutCtaText: { color: theme.white, fontWeight: '600' },
  // CommentThread
  commentThread: { gap: 14 },
  commentNode: { gap: 10, marginTop: 10 },
  commentRow: { flexDirection: 'row', gap: 8 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.divider, textAlign: 'center', lineHeight: 28, overflow: 'hidden' },
  commentHead: { fontSize: 12, color: theme.faint },
  commentText: { color: theme.ink, marginTop: 2, lineHeight: 20 },
  // FileList
  fileList: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, overflow: 'hidden' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  fileIcon: { fontSize: 20 },
  fileName: { flex: 1, fontWeight: '500', color: theme.ink },
  fileSize: { color: theme.faint, fontSize: 12 },
  // Checklist
  checklist: {},
  checkHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  checkTitle: { fontWeight: '700', color: theme.ink },
  checkCount: { color: theme.faint, fontSize: 12 },
  checkBar: { height: 6, borderRadius: 999, backgroundColor: theme.border, overflow: 'hidden', marginBottom: 10 },
  checkFill: { height: '100%', backgroundColor: theme.success, borderRadius: 999 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkBox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  checkBoxDone: { backgroundColor: theme.success, borderColor: theme.success },
  checkMark: { color: theme.white, fontSize: 13, fontWeight: '700' },
  checkLabel: { color: theme.ink, flex: 1 },
  checkLabelDone: { color: theme.faint, textDecorationLine: 'line-through' },
  // ComparisonCard
  cmpCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 16, backgroundColor: theme.white },
  cmpTitle: { fontWeight: '700', color: theme.ink, marginBottom: 12 },
  cmpRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cmpSide: { flex: 1, alignItems: 'center' },
  cmpLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: theme.faint },
  cmpValue: { fontSize: 26, fontWeight: '800', color: theme.ink, marginTop: 2 },
  cmpMid: { alignItems: 'center', gap: 4 },
  cmpArrow: { fontSize: 18, color: theme.faint },
  cmpDelta: { fontWeight: '700', fontSize: 12, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8, overflow: 'hidden' },
  // Shared chip (badge palette)
  uxChip: { color: theme.white, fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden', alignSelf: 'flex-start' },
  // EntityHeader
  entityHeader: { flexDirection: 'row', gap: 16, padding: 16, borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: theme.background },
  entityLeft: { flex: 1, gap: 4 },
  entityTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  entityTitle: { fontSize: 18, fontWeight: '700', color: theme.ink },
  entitySubtitle: { color: theme.muted, fontSize: 13 },
  entityFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  entityFact: { gap: 1 },
  entityFactLabel: { fontSize: 10, fontWeight: '700', color: theme.faint, letterSpacing: 0.6 },
  entityFactValue: { fontSize: 13, fontWeight: '500', color: theme.ink },
  entityMetric: { alignItems: 'flex-end', gap: 1, justifyContent: 'center' },
  entityMetricValue: { fontSize: 24, fontWeight: '800', color: theme.primary },
  entityMetricCaption: { fontSize: 11, color: theme.faint },
  // Meter
  meter: { gap: 4 },
  meterLabel: { fontSize: 11, fontWeight: '700', color: theme.faint, letterSpacing: 0.6 },
  meterValue: { fontSize: 24, fontWeight: '700', color: theme.ink },
  meterTrack: { height: 8, borderRadius: 4, backgroundColor: theme.border, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 4 },
  meterCaption: { fontSize: 12, color: theme.faint },
  // TaskProgress
  taskProgress: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: 12, borderRadius: 12 },
  taskProgressIcon: { fontSize: 18 },
  taskProgressLabel: { flex: 1, color: theme.ink, fontWeight: '500', minWidth: 120 },
  taskProgressPills: { flexDirection: 'row', gap: 4 },
  taskProgressPill: { fontSize: 11, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  taskProgressPillDone: { backgroundColor: theme.success, color: theme.white },
  taskProgressPillTodo: { borderWidth: 1, borderColor: theme.faint, color: theme.muted },
  taskProgressBtn: { backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  taskProgressBtnText: { color: theme.white, fontWeight: '600', fontSize: 13 },
  // Notice
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  noticeSlim: { paddingVertical: 3, paddingHorizontal: 8, gap: 6 },
  noticeIcon: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  noticeIconText: { color: theme.white, fontSize: 11, fontWeight: '700' },
  noticeText: { fontWeight: '600', fontSize: 13 },
  noticeBody: { flex: 1, gap: 4 },
  noticeBodyInline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeBtn: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  noticeBtnText: { color: theme.white, fontWeight: '600', fontSize: 11 },
  // BulletedList
  bulletedList: { gap: 2, paddingVertical: 2 },
  bulletedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2 },
  bulletedDot: { color: theme.faint, lineHeight: 20 },
  bulletedText: { flex: 1, color: theme.ink, fontSize: 14, lineHeight: 20 },
  // StatusList
  statusList: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, overflow: 'hidden' },
  statusListFrameless: { borderWidth: 0, borderRadius: 0 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  statusRowCompact: { gap: 8, paddingVertical: 5, paddingHorizontal: 10 },
  statusIcon: { fontSize: 18 },
  statusAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(26,115,232,.12)' },
  statusAvatarCompact: { width: 24, height: 24, borderRadius: 12 },
  statusAvatarText: { color: theme.primary, fontWeight: '600', fontSize: 10, letterSpacing: 0.3 },
  statusBody: { flex: 1, gap: 1 },
  statusTitle: { fontWeight: '600', color: theme.ink },
  statusDesc: { fontSize: 12, color: theme.faint },
  statusBtn: { borderWidth: 1, borderColor: theme.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusBtnText: { color: theme.primary, fontWeight: '600', fontSize: 12 },
  // TaskQueue
  taskQueue: { gap: 14 },
  taskQueueGroup: { gap: 8 },
  taskQueueGroupLabel: { fontSize: 10, fontWeight: '700', color: theme.faint, letterSpacing: 0.8 },
  queueCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 10, gap: 4, backgroundColor: theme.white },
  queueCardSelected: { borderColor: theme.primary, borderWidth: 2, backgroundColor: 'rgba(26,115,232,0.08)' },
  queueCardTitle: { fontWeight: '600', color: theme.ink },
  queueCardFoot: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  queueCardCaption: { fontSize: 12, color: theme.faint, fontVariant: ['tabular-nums'] },
  // ResourceGrid
  resourceGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -4 },
  resourceCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 10, gap: 4, backgroundColor: theme.white, minHeight: 88 },
  resourceCardAccent: { borderColor: theme.primary, borderWidth: 2 },
  resourceCardSelected: { backgroundColor: 'rgba(26,115,232,0.08)' },
  resourceCardDisabled: { opacity: 0.45 },
  resourceTag: { alignSelf: 'flex-start', fontSize: 8, fontWeight: '800', color: theme.white, backgroundColor: theme.primary, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden', letterSpacing: 0.5 },
  resourceTitle: { fontSize: 17, fontWeight: '700', color: theme.ink },
  resourceSubtitle: { fontSize: 12, color: theme.faint },
  resourceNote: { fontSize: 11 },
  // OfferCard
  offerCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 14, overflow: 'hidden', backgroundColor: theme.white },
  offerCardAccent: { borderColor: theme.primary, borderWidth: 2 },
  offerImage: { width: '100%', aspectRatio: 16 / 9 },
  offerTag: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '800', color: theme.white, backgroundColor: theme.ink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden', letterSpacing: 0.5 },
  offerTagFloating: { position: 'absolute', top: 10, left: 10 },
  offerBody: { padding: 14, gap: 6 },
  offerTitle: { fontSize: 17, fontWeight: '700', color: theme.ink },
  offerSubtitle: { fontSize: 13, color: theme.muted },
  offerFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  offerFeature: { fontSize: 12, color: theme.ink, borderWidth: 1, borderColor: '#d4d4d8', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  offerCurrentLabel: { color: theme.faint, fontWeight: '500', marginTop: 4 },
  offerCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, marginTop: 4 },
  offerCtaAdded: { backgroundColor: theme.success },
  offerCtaText: { color: theme.white, fontWeight: '600' },
  offerCtaPrice: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontVariant: ['tabular-nums'] },
  // AddOnPicker
  addOnPicker: { gap: 8 },
  addOnHead: { flexDirection: 'row', justifyContent: 'flex-end' },
  addOnTotal: { fontWeight: '700', color: theme.primary, fontVariant: ['tabular-nums'] },
  addOnGrid: { gap: 8 },
  addOnCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12, gap: 6, backgroundColor: theme.white },
  addOnCardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addOnIcon: { fontSize: 20 },
  addOnTitle: { fontWeight: '600', color: theme.ink },
  addOnDesc: { fontSize: 12, color: theme.faint },
  addOnToggle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  addOnToggleAdded: { backgroundColor: theme.primary },
  addOnToggleText: { color: theme.primary, fontWeight: '700', fontSize: 16 },
  addOnToggleTextAdded: { color: theme.white },
  addOnPrice: { color: theme.primary, fontWeight: '600', fontVariant: ['tabular-nums'] },
  addOnIncluded: { color: theme.faint, fontStyle: 'italic', fontSize: 13 },
  // Ledger
  ledger: { gap: 6 },
  ledgerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  ledgerConcept: { flex: 1, color: theme.ink },
  ledgerAmount: { color: theme.ink, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ledgerAmountNegative: { color: theme.danger },
  ledgerIncluded: { color: theme.faint, fontStyle: 'italic', fontSize: 13 },
  ledgerDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#d4d4d8', marginVertical: 4 },
  ledgerTotalLabel: { fontWeight: '700', color: theme.ink },
  ledgerTotal: { fontSize: 18, fontWeight: '800', color: theme.ink, fontVariant: ['tabular-nums'] },
  // PaymentPicker
  paymentPicker: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  paymentMethods: { flexDirection: 'row', gap: 6 },
  paymentMethod: { borderWidth: 1, borderColor: '#d4d4d8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  paymentMethodSelected: { borderColor: theme.primary, borderWidth: 2, backgroundColor: 'rgba(26,115,232,0.08)' },
  paymentMethodText: { color: theme.ink, fontWeight: '500' },
  paymentMethodTextSelected: { color: theme.primary, fontWeight: '700' },
  paymentContext: { backgroundColor: 'rgba(18,183,106,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 1 },
  paymentContextLabel: { fontSize: 9, fontWeight: '700', color: theme.success, letterSpacing: 0.6 },
  paymentContextValue: { fontWeight: '700', color: theme.ink, fontVariant: ['tabular-nums'] },
  paymentConfirm: { marginLeft: 'auto', backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11 },
  paymentConfirmText: { color: theme.white, fontWeight: '700' },
  // ProcessMonitor
  processMonitor: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, overflow: 'hidden' },
  processRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  processDot: { fontSize: 12 },
  processBody: { flex: 1, gap: 1, minWidth: 120 },
  processName: { fontWeight: '600', color: theme.ink },
  processSystems: { fontSize: 11, color: theme.faint },
  processCounters: { flexDirection: 'row', gap: 10 },
  processCounter: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  processBtn: { borderWidth: 1, borderColor: theme.warning, backgroundColor: 'rgba(240,171,0,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  processBtnText: { color: '#8a6100', fontWeight: '600', fontSize: 12 },
});
