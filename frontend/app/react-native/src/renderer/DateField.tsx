import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../ui/Text';
import { theme, themed } from '../theme';
import { OutlinedTrigger } from '../ui/controls';
import { buttonA11y } from '../a11y/a11y';
import { committedValue, displayValue, MONTHS, monthWeeks, parseIso, shiftedMonth, today, WEEKDAYS, type Ymd } from './dateCalendar';

/**
 * Dependency-free date / datetime picker (like the IntelliJ and Compose renderers' own
 * calendars): the field shows the ISO value and opens a month-grid calendar in a modal.
 * Commits 'YYYY-MM-DD' (date) or 'YYYY-MM-DDTHH:mm' (datetime) — the wire format for
 * LocalDate/LocalDateTime fields.
 */

interface Props {
  value: string;
  editable: boolean;
  withTime?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  /** With a label the trigger is a Material outlined field (label inside, calendar icon). */
  label?: string;
  required?: boolean;
  error?: string;
}

export function DateField({ value, editable, withTime = false, placeholder, onChange, label, required, error }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseIso(value);
  // month shown by the calendar (defaults to the value's month, else the current one)
  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => {
    const base = parsed.date ?? today();
    return { y: base.y, m: base.m };
  });
  const [time, setTime] = useState(parsed.time || (withTime ? '00:00' : ''));

  const commit = (date: Ymd, t = time) => {
    onChange(committedValue(date, withTime, t));
    setOpen(false);
  };

  const openCalendar = () => {
    if (!editable) return;
    const base = parseIso(value).date ?? today();
    setCursor({ y: base.y, m: base.m });
    setTime(parseIso(value).time || (withTime ? '00:00' : ''));
    setOpen(true);
  };

  const shiftMonth = (delta: number) => setCursor(shiftedMonth(cursor, delta));

  const selected = parsed.date;
  const now = today();
  const weeks = monthWeeks(cursor.y, cursor.m);
  const display = displayValue(value, withTime);

  return (
    <View>
      {label ? (
        <OutlinedTrigger
          label={label}
          required={required}
          error={error}
          value={display}
          placeholder={placeholder || 'YYYY-MM-DD'}
          icon="calendar-blank-outline"
          disabled={!editable}
          accessibilityLabel={`${label}: ${display || 'not set'}`}
          onPress={openCalendar}
        />
      ) : (
        <TouchableOpacity {...buttonA11y({ label: placeholder ? `${placeholder}: ${display || 'not set'}` : undefined })} style={styles.input} onPress={openCalendar} activeOpacity={editable ? 0.7 : 1}>
          <Text style={!display ? styles.placeholder : undefined}>{display || placeholder || 'YYYY-MM-DD'}</Text>
        </TouchableOpacity>
      )}
      {open && (
        <Modal accessibilityViewIsModal accessibilityLabel="Date picker" animationType="fade" transparent onRequestClose={() => setOpen(false)}>
          <TouchableOpacity {...buttonA11y()} style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
            <TouchableOpacity {...buttonA11y()} activeOpacity={1} style={styles.calendar} onPress={() => {}}>
              <View style={styles.monthBar}>
                <TouchableOpacity {...buttonA11y({ label: 'Previous month' })} style={styles.monthNav} onPress={() => shiftMonth(-1)}>
                  <Text style={styles.monthNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{MONTHS[cursor.m - 1]} {cursor.y}</Text>
                <TouchableOpacity {...buttonA11y({ label: 'Next month' })} style={styles.monthNav} onPress={() => shiftMonth(1)}>
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
                      <TouchableOpacity {...buttonA11y()}
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
                  <TouchableOpacity {...buttonA11y()} style={styles.footerButton} onPress={() => { onChange(''); setOpen(false); }}>
                    <Text style={styles.footerText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity {...buttonA11y()} style={styles.footerButton} onPress={() => commit(today())}>
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

const styles = themed(() => StyleSheet.create({
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
  calendar: { backgroundColor: theme.surface, borderRadius: theme.radiusLg, padding: 20, maxWidth: 360, alignSelf: 'center', width: '100%' },
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
  selectedText: { color: theme.onFill, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  timeLabel: { fontSize: 12, color: theme.muted, fontWeight: '500' },
  timeInput: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  footerButton: { paddingHorizontal: 12, paddingVertical: 8 },
  footerText: { color: theme.primary, fontWeight: '600', fontSize: 13 },
}));
