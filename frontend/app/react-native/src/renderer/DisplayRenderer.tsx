import React, { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';
import { CalendarEvent, Comment, EmptyState, FaqItem, Feature, FileItem, FoldoutPanelInfo, FunnelStage, GanttTask, HeatCell, HeroSection, KanbanColumn, OrgNode, PricingPlan, Skeleton, Stat, Step, Testimonial, TimelineItem } from '../api/metadata';

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
          <View style={[styles.kanbanHead, { borderBottomColor: col.color ?? '#cbd5e1' }]}>
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
              <View style={[styles.timelineDot, { backgroundColor: it.color ?? '#1a73e8' }]}>
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
        const dotColor = done ? '#1a73e8' : current ? '#fff' : '#e5e7eb';
        return (
          <View key={s.id ?? i} style={styles.stepRow}>
            <View style={styles.stepRail}>
              <View style={[styles.stepDot, { backgroundColor: dotColor, borderColor: current ? '#1a73e8' : 'transparent' }]}>
                <Text style={[styles.stepDotText, { color: done ? '#fff' : current ? '#1a73e8' : '#666' }]}>{done ? '✓' : String(i + 1)}</Text>
              </View>
              {i < steps.length - 1 && <View style={[styles.stepLine, { backgroundColor: done ? '#1a73e8' : '#cbd5e1' }]} />}
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
  const trendColor = trend === 'down' ? '#e11d48' : trend === 'flat' ? '#888' : '#12b76a';
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
            <View style={[styles.agendaChip, { borderLeftColor: e.color ?? '#1a73e8' }]}>
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
    <View style={[styles.orgRow, { marginLeft: depth * 18, borderLeftColor: node.color ?? '#1a73e8' }]}>
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
            <View style={[styles.funnelBar, { width: `${Math.max(8, (value / maxVal) * 100)}%`, backgroundColor: s.color ?? '#1a73e8' }]}>
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
  const color = (m['color'] as string) ?? '#1a73e8';
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
  const theme = (m['theme'] as string) ?? 'info';
  const accent = theme === 'success' ? '#12b76a' : theme === 'warning' ? '#f59e0b' : theme === 'danger' ? '#e11d48' : '#1a73e8';
  const bg = theme === 'success' ? 'rgba(18,183,106,0.1)' : theme === 'warning' ? 'rgba(245,158,11,0.12)' : theme === 'danger' ? 'rgba(225,29,72,0.1)' : 'rgba(26,115,232,0.1)';
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
    <View style={[styles.commentNode, depth > 0 && { marginLeft: 14, borderLeftWidth: 2, borderLeftColor: '#e4e4e7', paddingLeft: 10 }]}>
      <View style={styles.commentRow}>
        <Text style={styles.commentAvatar}>{comment.avatar && !comment.avatar.includes(':') ? comment.avatar : (comment.author?.[0] ?? '?')}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentHead}>
            <Text style={{ fontWeight: '600', color: '#222' }}>{comment.author}</Text>
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

const styles = StyleSheet.create({
  // Foldout
  foldout: { gap: 12 },
  foldoutOverview: { backgroundColor: '#fff', borderColor: '#d2d2d2', borderWidth: 1, borderRadius: 8, padding: 16 },
  foldoutPanel: { borderWidth: 1, borderColor: '#d2d2d2', borderRadius: 8, overflow: 'hidden' },
  foldoutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fafafa' },
  foldoutHeaderText: { flex: 1, gap: 2 },
  foldoutTitle: { fontWeight: '700' },
  foldoutSubtitle: { fontSize: 12, color: '#666' },
  foldoutChevron: { color: '#666', marginLeft: 8 },
  foldoutBody: { padding: 12, backgroundColor: '#fff' },
  // Hero
  hero: { borderRadius: 12, overflow: 'hidden', justifyContent: 'center' },
  heroPlain: { backgroundColor: '#f5f5f5' },
  heroImage: { borderRadius: 12 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroContent: { padding: 24, gap: 8 },
  heroTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34, color: '#1a1a1a' },
  heroSubtitle: { fontSize: 16, color: '#666' },
  heroTextOnImage: { color: '#fff' },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  // EmptyState
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  emptyIcon: { fontSize: 30, opacity: 0.6 },
  emptyTitle: { fontWeight: '600', color: '#333' },
  emptyDescription: { fontSize: 13, color: '#666', textAlign: 'center' },
  emptyBtn: { marginTop: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ccc' },
  emptyBtnText: { color: '#0066cc', fontSize: 14 },
  // Skeleton
  skeleton: { gap: 8, flex: 1 },
  bone: { backgroundColor: '#e5e5e5', borderRadius: 6 },
  boneText: { height: 12, alignSelf: 'stretch' },
  boneTextLast: { width: '60%', alignSelf: 'flex-start' },
  boneCard: { height: 90, alignSelf: 'stretch' },
  boneRow: { height: 36, alignSelf: 'stretch' },
  boneFormPair: { gap: 4 },
  boneLabel: { height: 10, width: '35%' },
  boneField: { height: 32, alignSelf: 'stretch' },
  // Gantt
  gantt: { flexDirection: 'row', borderWidth: 1, borderColor: '#d2d2d2', borderRadius: 8, padding: 8, backgroundColor: '#fff' },
  ganttLabels: { width: 110, marginRight: 8 },
  ganttLabelRow: { height: GANTT_ROW_H, justifyContent: 'center' },
  ganttLabel: { fontSize: 12, color: '#333' },
  ganttHeader: { height: GANTT_HEADER_H },
  ganttMonth: { position: 'absolute', top: 2, fontSize: 10, color: '#999' },
  ganttRow: { height: GANTT_ROW_H, justifyContent: 'center' },
  ganttBar: { position: 'absolute', height: 18, borderRadius: 4, overflow: 'hidden', justifyContent: 'center' },
  ganttProgress: { height: '100%', backgroundColor: 'rgba(0,0,0,0.25)' },
  ganttToday: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#c5221f' },
  ganttEmpty: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  // Kanban
  kanbanBoard: { gap: 12, paddingBottom: 4 },
  kanbanColumn: { width: 220, gap: 8, backgroundColor: '#f4f4f5', borderRadius: 12, padding: 10 },
  kanbanHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 6, borderBottomWidth: 2 },
  kanbanTitle: { fontWeight: '600', flex: 1, color: '#222' },
  kanbanCount: { fontSize: 12, color: '#666', backgroundColor: '#e4e4e7', borderRadius: 999, paddingHorizontal: 8, overflow: 'hidden' },
  kanbanCard: { backgroundColor: '#fff', borderColor: '#e4e4e7', borderWidth: 1, borderLeftWidth: 3, borderRadius: 8, padding: 10, gap: 4 },
  kanbanCardTitle: { fontWeight: '600', color: '#222' },
  kanbanCardDesc: { fontSize: 12, color: '#666' },
  kanbanBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', color: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
  // Timeline
  timeline: {},
  timelineRow: { flexDirection: 'row', gap: 10 },
  timelineRail: { alignItems: 'center', width: 26 },
  timelineDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  timelineDotIcon: { fontSize: 12, color: '#fff' },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#e4e4e7', marginVertical: 2, minHeight: 8 },
  timelineBody: { flex: 1, paddingBottom: 16 },
  timelineHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  timelineTitle: { fontWeight: '600', color: '#222' },
  timelineTime: { fontSize: 11, color: '#888' },
  timelineDesc: { color: '#666', marginTop: 2 },
  // ProgressSteps (vertical on mobile)
  steps: {},
  stepRow: { flexDirection: 'row', gap: 10 },
  stepRail: { alignItems: 'center', width: 32 },
  stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepDotText: { fontWeight: '700', fontSize: 13 },
  stepLine: { flex: 1, width: 2, marginVertical: 2, minHeight: 10 },
  stepBody: { flex: 1, paddingBottom: 18, paddingTop: 4 },
  stepTitle: { fontWeight: '600', color: '#222' },
  stepTitleMuted: { color: '#888', fontWeight: '500' },
  stepDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  // Stat
  statTile: { padding: 14, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 12, backgroundColor: '#fff', gap: 2, minWidth: 150 },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111' },
  statUnit: { fontSize: 15, fontWeight: '500', color: '#888' },
  statFoot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4, gap: 8 },
  statDelta: { fontSize: 12, fontWeight: '600' },
  statSpark: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 26 },
  statBar: { width: 4, borderRadius: 1 },
  // Calendar (agenda)
  agenda: { gap: 8 },
  agendaMonth: { fontWeight: '700', fontSize: 16, color: '#222', marginBottom: 4 },
  agendaRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  agendaDate: { width: 44, alignItems: 'center' },
  agendaDay: { fontWeight: '700', fontSize: 18, color: '#222' },
  agendaDow: { fontSize: 11, color: '#888', textTransform: 'uppercase' },
  agendaChip: { flex: 1, borderLeftWidth: 3, backgroundColor: '#f4f4f5', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
  agendaTitle: { fontWeight: '600', color: '#222' },
  // PricingTable
  pricing: { gap: 12 },
  planCard: { padding: 18, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 14, backgroundColor: '#fff', gap: 6 },
  planCardFeatured: { borderColor: '#1a73e8', borderWidth: 2 },
  planBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '700', color: '#fff', backgroundColor: '#1a73e8', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  planName: { fontWeight: '600', color: '#666' },
  planPrice: { fontSize: 30, fontWeight: '800', color: '#111' },
  planPeriod: { fontSize: 14, fontWeight: '500', color: '#888' },
  planFeature: { color: '#333', fontSize: 14 },
  planCta: { marginTop: 6, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#eef0f2' },
  planCtaFeatured: { backgroundColor: '#1a73e8' },
  planCtaText: { fontWeight: '600', color: '#222' },
  planCtaTextFeatured: { color: '#fff' },
  // OrgChart (indented tree)
  org: { gap: 6 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 6, backgroundColor: '#f4f4f5', borderRadius: 6 },
  orgAvatar: { fontSize: 18 },
  orgTitle: { fontWeight: '600', color: '#222' },
  orgSubtitle: { fontSize: 12, color: '#888' },
  // Heatmap
  heatWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  heatCell: { width: 12, height: 12, borderRadius: 2 },
  // Funnel
  funnel: { gap: 6, alignItems: 'center' },
  funnelStage: { alignItems: 'center', width: '100%' },
  funnelMeta: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  funnelLabel: { fontWeight: '600', color: '#222' },
  funnelConv: { fontSize: 11, color: '#888' },
  funnelBar: { height: 34, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  funnelValue: { color: '#fff', fontWeight: '700' },
  // TrendChart
  trend: { gap: 4 },
  trendTitle: { fontWeight: '600', color: '#222' },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 100 },
  trendBar: { flex: 1, borderRadius: 2, minWidth: 4 },
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  trendLabel: { fontSize: 11, color: '#888' },
  // FeatureGrid
  features: { gap: 10 },
  featureCard: { padding: 14, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 12, backgroundColor: '#fff', gap: 4 },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontWeight: '700', color: '#111' },
  featureDesc: { color: '#666', fontSize: 13 },
  // Testimonials
  testimonials: { gap: 10 },
  testimonialCard: { padding: 14, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 12, backgroundColor: '#fff', gap: 6 },
  testimonialStars: { color: '#f5a623', letterSpacing: 1 },
  testimonialQuote: { fontStyle: 'italic', color: '#333', lineHeight: 20 },
  testimonialAuthor: { color: '#666', fontSize: 13 },
  // Faq
  faq: { borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 12, overflow: 'hidden' },
  faqItem: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e4e4e7' },
  faqQ: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  faqQText: { fontWeight: '600', color: '#222', flex: 1 },
  faqChevron: { color: '#888', fontSize: 16 },
  faqA: { paddingHorizontal: 14, paddingBottom: 14, color: '#555', lineHeight: 20 },
  // CalloutCard
  callout: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14, borderLeftWidth: 4 },
  calloutIcon: { fontSize: 24 },
  calloutBody: { flex: 1, gap: 4 },
  calloutTitle: { fontWeight: '700', fontSize: 16, color: '#111' },
  calloutDesc: { color: '#555', lineHeight: 20 },
  calloutCta: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 16 },
  calloutCtaText: { color: '#fff', fontWeight: '600' },
  // CommentThread
  commentThread: { gap: 14 },
  commentNode: { gap: 10, marginTop: 10 },
  commentRow: { flexDirection: 'row', gap: 8 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eee', textAlign: 'center', lineHeight: 28, overflow: 'hidden' },
  commentHead: { fontSize: 12, color: '#888' },
  commentText: { color: '#333', marginTop: 2, lineHeight: 20 },
  // FileList
  fileList: { borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 12, overflow: 'hidden' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e4e4e7' },
  fileIcon: { fontSize: 20 },
  fileName: { flex: 1, fontWeight: '500', color: '#222' },
  fileSize: { color: '#888', fontSize: 12 },
});
