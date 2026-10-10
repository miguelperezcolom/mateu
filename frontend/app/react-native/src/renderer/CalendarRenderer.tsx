import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { theme } from '../theme';
import { buttonA11y } from '../a11y/a11y';
import {
  agenda, anchorOf, dayA11yLabel, dayInfo, dayOfMonth, dayParameters, eventA11yLabel, eventsOn, initialView,
  isDayActionable, monthWeeks, periodDates, periodTitle, switcherViews, timeRange, viewLabel, weekdayShort,
  WEEKDAY_HEADERS, type CalendarEventMeta, type CalendarMeta, type CalendarView, type Tone,
} from './calendar';

const TONE_BG: Record<Tone, string> = {
  info: theme.infoBg, success: theme.successBg, warning: theme.warningBg, danger: theme.dangerBg, neutral: theme.background,
};
const TONE_INK: Record<Tone, string> = {
  info: theme.info, success: theme.success, warning: theme.warning, danger: theme.danger, neutral: theme.muted,
};

const WEEK_COL_W = 128;
const MONTH_CELL_EVENTS = 2;

/**
 * Calendar (wire `Calendar`): month grid, Monday-to-Sunday week (a horizontal strip of 7 day
 * columns), single day, or the month's agenda (list). The view switcher (when `views` offers more
 * than one) is client-side state; a new calendar from the server resets it to the wire's `view`.
 * Periods, spans, tones and the screen-reader texts live in `calendar.ts`.
 *
 * With a `dayActionId` the date cells/headers are buttons dispatching it with `{ _date }`, exactly
 * like a Button with parameters; an event with an `actionId` is a button of its own.
 */
export function CalendarRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const metadata = ((component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
  const meta = metadata as CalendarMeta;
  const [view, setView] = React.useState<CalendarView>(() => initialView(meta));
  React.useEffect(() => { setView(initialView(meta)); }, [metadata]); // eslint-disable-line react-hooks/exhaustive-deps

  const anchor = anchorOf(meta);
  const views = switcherViews(meta);
  const dayActionable = isDayActionable(meta);
  const pressDay = (date: string) => void controller.runAction(meta.dayActionId!, { ...dayParameters(date) });

  /** A date-bearing box: a button when the day is actionable, else a plain view still named for screen readers. */
  const dayBox = (date: string, style: object, children: React.ReactNode, key?: string) =>
    dayActionable ? (
      <TouchableOpacity key={key} {...buttonA11y({ label: dayA11yLabel(meta, date) })} style={style} onPress={() => pressDay(date)}>
        {children}
      </TouchableOpacity>
    ) : (
      <View key={key} accessible accessibilityLabel={dayA11yLabel(meta, date)} style={style}>{children}</View>
    );

  const toneStyle = (date: string) => {
    const { tone } = dayInfo(meta, date);
    return tone ? { backgroundColor: TONE_BG[tone] } : null;
  };

  const dayLabel = (date: string) => {
    const { label, tone } = dayInfo(meta, date);
    return label ? (
      <Text numberOfLines={1} style={[styles.dayLabel, { color: tone ? TONE_INK[tone] : theme.muted }]}>{label}</Text>
    ) : null;
  };

  const eventChip = (e: CalendarEventMeta, key: string, compact = false) => {
    const time = timeRange(e);
    const body = (
      <View style={[styles.chip, compact && styles.chipCompact, { borderLeftColor: e.color ?? theme.primary }]}>
        {!compact && !!time && <Text style={styles.chipTime}>{time}</Text>}
        <Text numberOfLines={compact ? 1 : 2} style={[styles.chipTitle, compact && styles.chipTitleCompact]}>{e.title ?? ''}</Text>
      </View>
    );
    return e.actionId ? (
      <TouchableOpacity key={key} {...buttonA11y({ label: eventA11yLabel(e) })} onPress={() => void controller.runAction(e.actionId!)}>
        {body}
      </TouchableOpacity>
    ) : (
      <View key={key} accessible accessibilityLabel={eventA11yLabel(e)}>{body}</View>
    );
  };

  const monthView = () => (
    <View style={styles.month}>
      <View style={styles.weekRow}>
        {WEEKDAY_HEADERS.map((d) => <Text key={d} style={styles.weekdayHeader}>{d}</Text>)}
      </View>
      {monthWeeks(anchor).map((week, w) => (
        <View key={w} style={styles.weekRow}>
          {week.map((date, i) => {
            if (!date) return <View key={i} style={[styles.monthCell, styles.monthCellEmpty]} />;
            const events = eventsOn(meta, date);
            return dayBox(date, [styles.monthCell, toneStyle(date)], (
              <>
                <Text style={styles.dayNumber}>{dayOfMonth(date)}</Text>
                {dayLabel(date)}
                {events.slice(0, MONTH_CELL_EVENTS).map((e, j) => eventChip(e, `${e.id ?? j}`, true))}
                {events.length > MONTH_CELL_EVENTS && (
                  <Text style={styles.more}>+{events.length - MONTH_CELL_EVENTS}</Text>
                )}
              </>
            ), date);
          })}
        </View>
      ))}
    </View>
  );

  const dayHeader = (date: string) => dayBox(date, [styles.dayHeader, toneStyle(date)], (
    <>
      <Text style={styles.dayHeaderDow}>{weekdayShort(date)}</Text>
      <Text style={styles.dayHeaderNumber}>{dayOfMonth(date)}</Text>
      {dayLabel(date)}
    </>
  ));

  const weekView = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={styles.weekStrip}>
        {periodDates('week', anchor).map((date) => (
          <View key={date} style={styles.weekCol}>
            {dayHeader(date)}
            {eventsOn(meta, date).map((e, j) => eventChip(e, `${e.id ?? j}`))}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const dayView = () => {
    const date = periodDates('day', anchor)[0];
    const events = eventsOn(meta, date);
    return (
      <View style={styles.dayView}>
        {dayHeader(date)}
        {events.length ? events.map((e, j) => eventChip(e, `${e.id ?? j}`)) : <Text style={styles.empty}>No events</Text>}
      </View>
    );
  };

  const listView = () => {
    const groups = agenda(meta, anchor);
    if (!groups.length) return <Text style={styles.empty}>No events</Text>;
    return (
      <View style={styles.agenda}>
        {groups.map((g) => (
          <View key={g.date} style={styles.agendaRow}>
            {dayBox(g.date, [styles.agendaDate, toneStyle(g.date)], (
              <>
                <Text style={styles.dayHeaderNumber}>{dayOfMonth(g.date)}</Text>
                <Text style={styles.dayHeaderDow}>{weekdayShort(g.date)}</Text>
              </>
            ))}
            <View style={styles.agendaEvents}>
              {dayLabel(g.date)}
              {g.events.map((e, j) => eventChip(e, `${e.id ?? j}`))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.toolbar}>
        <Text accessibilityRole="header" style={styles.title}>{periodTitle(view, anchor)}</Text>
        {views.length > 1 && (
          <View style={styles.switcher} accessibilityRole="tablist">
            {views.map((v) => (
              <TouchableOpacity
                key={v}
                {...buttonA11y({ role: 'tab', selected: v === view, label: `${viewLabel(v)} view` })}
                style={[styles.segment, v === view && styles.segmentActive]}
                onPress={() => setView(v)}
              >
                <Text style={[styles.segmentText, v === view && styles.segmentTextActive]}>{viewLabel(v)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {view === 'month' ? monthView() : view === 'week' ? weekView() : view === 'day' ? dayView() : listView()}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { gap: 8 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  title: { fontWeight: '700', fontSize: 16, color: theme.ink },
  switcher: { flexDirection: 'row', borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, overflow: 'hidden' },
  segment: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme.white },
  segmentActive: { backgroundColor: theme.primary },
  segmentText: { fontSize: 12, fontWeight: '600', color: theme.ink },
  segmentTextActive: { color: theme.onPrimary },
  // month
  month: { borderWidth: 1, borderColor: theme.divider, borderRadius: theme.radiusSm, overflow: 'hidden' },
  weekRow: { flexDirection: 'row' },
  weekdayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: theme.muted, paddingVertical: 4 },
  monthCell: { flex: 1, minHeight: 58, padding: 3, borderTopWidth: 1, borderLeftWidth: 1, borderColor: theme.divider, gap: 2 },
  monthCellEmpty: { backgroundColor: theme.background },
  dayNumber: { fontSize: 12, fontWeight: '700', color: theme.ink },
  dayLabel: { fontSize: 10, fontWeight: '600' },
  more: { fontSize: 10, color: theme.muted },
  // day headers (week, day, list)
  dayHeader: { padding: 6, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.divider, alignItems: 'flex-start' },
  dayHeaderDow: { fontSize: 11, color: theme.muted, textTransform: 'uppercase' },
  dayHeaderNumber: { fontSize: 18, fontWeight: '700', color: theme.ink },
  // week
  weekStrip: { flexDirection: 'row', gap: 6 },
  weekCol: { width: WEEK_COL_W, gap: 4 },
  // day
  dayView: { gap: 6 },
  // list
  agenda: { gap: 10 },
  agendaRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  agendaDate: { width: 48, alignItems: 'center', paddingVertical: 4, borderRadius: theme.radiusSm },
  agendaEvents: { flex: 1, gap: 4 },
  // events
  chip: { borderLeftWidth: 3, backgroundColor: theme.background, borderRadius: theme.radiusSm, paddingHorizontal: 8, paddingVertical: 6 },
  chipCompact: { paddingHorizontal: 3, paddingVertical: 1, borderLeftWidth: 2 },
  chipTime: { fontSize: 11, color: theme.muted },
  chipTitle: { fontWeight: '600', color: theme.ink },
  chipTitleCompact: { fontSize: 10, fontWeight: '500' },
  empty: { color: theme.faint, fontStyle: 'italic' },
});
