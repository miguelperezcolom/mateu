import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { theme } from '../theme';
import {
  Image,
  Linking,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** Widgets for the long tail of field stereotypes (radio, multiSelect, slider, stepper, stars,
 *  color, image upload, money text, light markdown) — dependency-free except expo-image-picker. */

export interface WidgetOption {
  value: string;
  label: string;
}

// ── radio ────────────────────────────────────────────────────────────────────────────────────

export function RadioField({ options, value, editable, onChange }: {
  options: WidgetOption[];
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.radioGroup}>
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={styles.radioRow}
            disabled={!editable}
            onPress={() => onChange(opt.value)}
          >
            <View style={[styles.radioOuter, on && styles.radioOuterOn]}>
              {on && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── multi-select (Set<Enum> fields) ──────────────────────────────────────────────────────────

export function MultiSelectField({ options, value, editable, onChange }: {
  options: WidgetOption[];
  value: string[];
  editable: boolean;
  onChange: (v: string[]) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const on = value.includes(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, on && styles.chipOn]}
            disabled={!editable}
            onPress={() => onChange(on ? value.filter((v) => v !== opt.value) : [...value, opt.value])}
          >
            <Text style={on ? styles.chipOnText : styles.chipText}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── slider / stepper ─────────────────────────────────────────────────────────────────────────

export function SliderField({ min, max, step, value, editable, onChange }: {
  min: number;
  max: number;
  step: number;
  value: number;
  editable: boolean;
  onChange: (v: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const span = max - min || 1;
  const stepSize = step > 0 ? step : 1;

  const valueAt = (x: number) => {
    const ratio = Math.max(0, Math.min(1, width > 0 ? x / width : 0));
    const raw = min + ratio * span;
    return Math.max(min, Math.min(max, Math.round(raw / stepSize) * stepSize));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onMoveShouldSetPanResponder: () => editable,
      onPanResponderGrant: (e) => onChange(valueAt(e.nativeEvent.locationX)),
      onPanResponderMove: (e) => onChange(valueAt(e.nativeEvent.locationX)),
    }),
  );

  const ratio = Math.max(0, Math.min(1, (value - min) / span));
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderBound}>{min}</Text>
      <View
        ref={trackRef}
        style={styles.sliderTrack}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...pan.current.panHandlers}
      >
        <View style={[styles.sliderFill, { width: `${ratio * 100}%` }]} />
        <View style={[styles.sliderThumb, { left: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.sliderBound}>{max}</Text>
      <Text style={styles.sliderValue}>{value}</Text>
    </View>
  );
}

export function StepperField({ value, step, editable, onChange }: {
  value: number;
  step: number;
  editable: boolean;
  onChange: (v: number) => void;
}) {
  const delta = step > 0 ? step : 1;
  return (
    <View style={styles.stepperRow}>
      <TouchableOpacity style={styles.stepperButton} disabled={!editable} onPress={() => onChange(value - delta)}>
        <Text style={styles.stepperButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity style={styles.stepperButton} disabled={!editable} onPress={() => onChange(value + delta)}>
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── stars rating ─────────────────────────────────────────────────────────────────────────────

export function StarsField({ value, editable, onChange }: {
  value: number;
  editable: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} disabled={!editable} onPress={() => onChange(n === value ? 0 : n)}>
          <Text style={[styles.star, n <= value && styles.starOn]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── color ────────────────────────────────────────────────────────────────────────────────────

const PALETTE = [theme.danger, theme.warning, '#fdd835', theme.success, theme.info, '#8e24aa', '#6d4c41', '#546e7a', '#000000', theme.white];

export function ColorField({ value, editable, onChange }: {
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <View style={styles.colorRow}>
        <View style={[styles.colorSwatch, { backgroundColor: value || theme.white }]} />
        <TextInput
          style={[styles.textInput, { flex: 1 }]}
          value={value}
          onChangeText={onChange}
          placeholder="#rrggbb"
          editable={editable}
          autoCapitalize="none"
        />
      </View>
      {editable && (
        <View style={styles.chips}>
          {PALETTE.map((c) => (
            <TouchableOpacity key={c} style={[styles.colorOption, { backgroundColor: c }]} onPress={() => onChange(c)} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── images ───────────────────────────────────────────────────────────────────────────────────

/** @UploadableImage: preview + pick-from-library → data URI (same self-contained round-trip as the web). */
export function UploadableImageField({ value, editable, onChange }: {
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.8,
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    if (asset.base64) onChange(`data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`);
    else if (asset.uri) onChange(asset.uri);
  };

  return (
    <View>
      {value ? <Image source={{ uri: value }} style={styles.imagePreview} resizeMode="contain" /> : null}
      {editable && (
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={() => void pick()}>
            <Text style={styles.imageButtonText}>{value ? 'Replace' : 'Upload'}</Text>
          </TouchableOpacity>
          {!!value && (
            <TouchableOpacity style={styles.imageButton} onPress={() => onChange('')}>
              <Text style={styles.imageDeleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export function ImagePreview({ value }: { value: string }) {
  if (!value) return <Text style={styles.emptyText}>—</Text>;
  return <Image source={{ uri: value }} style={styles.imagePreview} resizeMode="contain" />;
}

// ── read-only text renderings ────────────────────────────────────────────────────────────────

export function formatMoney(value: unknown): string {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (isNaN(n)) return String(value ?? '');
  try {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

export function LinkText({ value }: { value: string }) {
  if (!value) return <Text style={styles.emptyText}>—</Text>;
  return (
    <TouchableOpacity onPress={() => void Linking.openURL(value)}>
      <Text style={styles.link}>{value}</Text>
    </TouchableOpacity>
  );
}

const stripHtml = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

/** Light markdown/HTML rendering: headings, bold-only lines, bullets — enough for @Help texts
 *  and read-only content fields without pulling a rendering dependency. */
export function RichText({ value, kind }: { value: string; kind: 'markdown' | 'html' | 'richText' }) {
  const text = kind === 'markdown' ? value : stripHtml(value);
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (kind === 'markdown' && heading) {
          const level = heading[1].length;
          return (
            <Text key={i} style={[styles.mdHeading, { fontSize: 22 - level * 2 }]}>
              {heading[2]}
            </Text>
          );
        }
        const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
        if (bullet) {
          return (
            <Text key={i} style={styles.mdText}>
              {'  • '}
              {renderInline(bullet[1], kind)}
            </Text>
          );
        }
        return (
          <Text key={i} style={styles.mdText}>
            {renderInline(line, kind)}
          </Text>
        );
      })}
    </View>
  );
}

function renderInline(line: string, kind: string): React.ReactNode {
  if (kind !== 'markdown') return line;
  // **bold** spans only — the pragmatic subset
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Text key={i} style={styles.mdBold}>{part.slice(2, -2)}</Text>
    ) : (
      part
    ),
  );
}

export function BadgeChip({ label, on }: { label: string; on: boolean }) {
  return (
    <View style={[styles.badgeChip, on && styles.badgeChipOn]}>
      <Text style={on ? styles.badgeChipOnText : styles.badgeChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  radioGroup: { gap: 8 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.faint, alignItems: 'center', justifyContent: 'center' },
  radioOuterOn: { borderColor: theme.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary },
  radioLabel: { fontSize: 14, color: theme.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.white },
  chipOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { fontSize: 13, color: theme.ink },
  chipOnText: { fontSize: 13, color: theme.white },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderBound: { fontSize: 11, color: theme.faint },
  sliderTrack: { flex: 1, height: 28, justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, height: 4, borderRadius: 2, backgroundColor: theme.primary },
  sliderThumb: { position: 'absolute', marginLeft: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.primary },
  sliderValue: { minWidth: 32, textAlign: 'right', fontSize: 13, fontWeight: '600', color: theme.ink },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperButton: { width: 36, height: 36, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  stepperButtonText: { fontSize: 18, color: theme.ink },
  stepperValue: { minWidth: 40, textAlign: 'center', fontSize: 15, fontWeight: '600', color: theme.ink },
  starsRow: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 26, color: theme.border },
  starOn: { color: theme.warning },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSwatch: { width: 36, height: 36, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  colorOption: { width: 28, height: 28, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  textInput: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: theme.white, minHeight: 42 },
  imagePreview: { width: '100%', height: 160, borderRadius: theme.radiusSm, backgroundColor: theme.background },
  imageButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  imageButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background },
  imageButtonText: { fontSize: 13, color: theme.ink },
  imageDeleteText: { fontSize: 13, color: theme.danger },
  emptyText: { color: theme.faint },
  link: { color: theme.primary, textDecorationLine: 'underline', fontSize: 14 },
  mdHeading: { fontWeight: '700', color: theme.ink, marginTop: 8, marginBottom: 4 },
  mdText: { fontSize: 14, color: theme.ink, lineHeight: 21 },
  mdBold: { fontWeight: '700' },
  badgeChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.divider },
  badgeChipOn: { backgroundColor: theme.successBg },
  badgeChipText: { fontSize: 12, color: theme.faint },
  badgeChipOnText: { fontSize: 12, color: theme.success, fontWeight: '600' },
});
