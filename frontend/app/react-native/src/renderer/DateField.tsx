import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

/**
 * Dependency-free date / datetime picker (like the IntelliJ and Compose renderers' own
 * calendars): the field shows the ISO value and opens a month-grid calendar in a modal.
 * Commits 'YYYY-MM-DD' (date) or 'YYYY-MM-DDTHH:mm' (datetime) — the wire format for
 * LocalDate/LocalDateTime fields.
 */

interface Ymd {
  y: number;
  m: number; // 1..12
  d: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const pad = (n: number): string => String(n).padStart(2, '0');
const formatDate = ({ y, m, d }: Ymd): string => `${y}-${pad(m)}-${pad(d)}`;

function parseIso(value: string): { date: Ymd | null; time: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}))?/.exec(value ?? '');
  if (!m) return { date: null, time: '' };
  return { date: { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }, time: m[4] ?? '' };
}

function today(): Ymd {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

const daysInMonth = (y: number, m: number): number => new Date(y, m, 0).getDate();
// Monday-first weekday of the month's day 1 (0=Mo .. 6=Su)
const firstWeekday = (y: number, m: number): number => (new Date(y, m - 1, 1).getDay() + 6) % 7;

interface Props {
  value: string;
  editable: boolean;
  withTime?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function DateField({ value, editable, withTime = false, placeholder, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseIso(value);
  // month shown by the calendar (defaults to the value's month, else the current one)
  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => {
    const base = parsed.date ?? today();
    return { y: base.y, m: base.m };
  });
  const [time, setTime] = useState(parsed.time || (withTime ? '00:00' : ''));

  const commit = (date: Ymd, t = time) => {
    onChange(withTime ? `${formatDate(date)}T${/^\d{2}:\d{2}$/.test(t) ? t : '00:00'}` : formatDate(date));
    setOpen(false);
  };

  const openCalendar = () => {
    if (!editable) return;
    const base = parseIso(value).date ?? today();
    setCursor({ y: base.y, m: base.m });
    setTime(parseIso(value).time || (withTime ? '00:00' : ''));
    setOpen(true);
  };

  const shiftMonth = (delta: number) => {
    let { y, m } = cursor;
    m += delta;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setCursor({ y, m });
  };

  const selected = parsed.date;
  const now = today();
  const lead = firstWeekday(cursor.y, cursor.m);
  const total = daysInMonth(cursor.y, cursor.m);
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const display = value
    ? withTime && parsed.date
      ? `${formatDate(parsed.date)} ${parsed.time}`.trim()
      : value
    : '';

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={openCalendar} activeOpacity={editable ? 0.7 : 1}>
        <Text style={!display ? styles.placeholder : undefined}>{display || placeholder || 'YYYY-MM-DD'}</Text>
      </TouchableOpacity>
      {open && (
        <Modal animationType="fade" transparent onRequestClose={() => setOpen(false)}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.calendar} onPress={() => {}}>
              <View style={styles.monthBar}>
                <TouchableOpacity style={styles.monthNav} onPress={() => shiftMonth(-1)}>
                  <Text style={styles.monthNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{MONTHS[cursor.m - 1]} {cursor.y}</Text>
                <TouchableOpacity style={styles.monthNav} onPress={() => shiftMonth(1)}>
                  <Text style={styles.monthNavText}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.weekRow}>
                {WEEKDAYS.map((w) => (
                  <Text key={w} style={[styles.dayCell, styles.weekdayText]}>{w}</Text>
                ))}
              </View>
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {week.map((day, di) => {
                    if (day === null) return <View key={di} style={styles.dayCell} />;
                    const isSelected =
                      !!selected && selected.y === cursor.y && selected.m === cursor.m && selected.d === day;
                    const isToday = now.y === cursor.y && now.m === cursor.m && now.d === day;
                    return (
                      <TouchableOpacity
                        key={di}
                        style={[styles.dayCell, styles.dayTouch, isToday && styles.todayCell, isSelected && styles.selectedCell]}
                        onPress={() => commit({ y: cursor.y, m: cursor.m, d: day })}
                      >
                        <Text style={[styles.dayText, isSelected && styles.selectedText]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              {withTime && (
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    autoCapitalize="none"
                  />
                </View>
              )}
              <View style={styles.footer}>
                {!!value && (
                  <TouchableOpacity style={styles.footerButton} onPress={() => { onChange(''); setOpen(false); }}>
                    <Text style={styles.footerText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.footerButton} onPress={() => commit(today())}>
                  <Text style={styles.footerText}>Today</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.white,
    minHeight: 42,
    justifyContent: 'center',
  },
  placeholder: { color: theme.faint },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  calendar: { backgroundColor: theme.white, borderRadius: 12, padding: 16, maxWidth: 360, alignSelf: 'center', width: '100%' },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthNav: { paddingHorizontal: 14, paddingVertical: 4 },
  monthNavText: { fontSize: 20, color: theme.primary },
  monthTitle: { fontSize: 15, fontWeight: '600', color: theme.ink },
  weekRow: { flexDirection: 'row' },
  weekdayText: { fontWeight: '600', color: theme.faint, fontSize: 11, textAlign: 'center' },
  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  dayTouch: { borderRadius: 16 },
  dayText: { fontSize: 13, color: theme.ink },
  todayCell: { borderWidth: 1, borderColor: theme.primary, borderRadius: 16 },
  selectedCell: { backgroundColor: theme.primary, borderRadius: 16 },
  selectedText: { color: theme.white, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  timeLabel: { fontSize: 12, color: theme.muted, fontWeight: '500' },
  timeInput: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  footerButton: { paddingHorizontal: 12, paddingVertical: 8 },
  footerText: { color: theme.primary, fontWeight: '600', fontSize: 13 },
});
