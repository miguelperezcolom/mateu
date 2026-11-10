import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { theme, themed } from '../theme';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import { Image } from './BackendImage';
import { acceptsMedia, fileValueSummary } from './fileUpload';
import { RadioButton } from 'react-native-paper';
import { TouchableOpacity } from '../ui/Touchable';
import { Text, TextInput } from '../ui/Text';
import { buttonA11y } from '../a11y/a11y';
import { decimalDraft, moneyText } from '../core/uxRules';
import { htmlToMarkdown } from './htmlText';
import { MarkdownView } from './MarkdownView';
import { openExternal } from './openExternal';

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
          <TouchableOpacity {...buttonA11y()}
            key={opt.value}
            style={styles.radioRow}
            disabled={!editable}
            onPress={() => onChange(opt.value)}
          >
            <RadioButton.Android value={opt.value} status={on ? 'checked' : 'unchecked'} disabled={!editable} onPress={() => onChange(opt.value)} color={theme.primary} uncheckedColor={theme.muted} />
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
          <TouchableOpacity {...buttonA11y()}
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

/** `@Stereotype(checkbox)` on a collection: one checkbox per option (the web's checkbox group) —
 *  it was drawn as a single-select dropdown. */
export function CheckboxGroupField({ options, value, editable, onChange }: {
  options: WidgetOption[];
  value: string[];
  editable: boolean;
  onChange: (v: string[]) => void;
}) {
  return (
    <View style={styles.checkGroup}>
      {options.map((opt) => {
        const on = value.includes(opt.value);
        return (
          <TouchableOpacity {...buttonA11y({ role: 'checkbox', selected: on, disabled: !editable, label: opt.label })}
            key={opt.value}
            style={styles.checkGroupRow}
            disabled={!editable}
            onPress={() => onChange(on ? value.filter((v) => v !== opt.value) : [...value, opt.value])}
          >
            <View style={[styles.checkGroupBox, on && styles.checkGroupBoxOn, !editable && styles.checkGroupBoxOff]}>
              {on && <Text style={styles.checkGroupTick}>✓</Text>}
            </View>
            <Text style={styles.radioLabel}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** `@Stereotype(listBox)`: the options as an always-open list, the chosen one marked (vaadin-list-box). */
export function ListBoxField({ options, value, editable, onChange }: {
  options: WidgetOption[];
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.listBox} accessibilityRole="list">
      {options.map((opt, i) => {
        const on = opt.value === value;
        return (
          <TouchableOpacity {...buttonA11y({ role: 'radio', selected: on, disabled: !editable, label: opt.label })}
            key={opt.value}
            style={[styles.listBoxItem, i > 0 && styles.listBoxDivider, on && styles.listBoxItemOn]}
            disabled={!editable}
            onPress={() => onChange(opt.value)}
          >
            <Text style={styles.listBoxCheck}>{on ? '✓' : ' '}</Text>
            <Text style={[styles.radioLabel, on && styles.listBoxLabelOn]}>{opt.label}</Text>
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
  /** null = unset: shown empty (not as a 0 nobody entered); a step starts from 0 */
  value: number | null;
  step: number;
  editable: boolean;
  onChange: (v: number) => void;
}) {
  const delta = step > 0 ? step : 1;
  const base = value ?? 0;
  return (
    <View style={styles.stepperRow}>
      <TouchableOpacity {...buttonA11y()} style={styles.stepperButton} disabled={!editable} onPress={() => onChange(base - delta)}>
        <Text style={styles.stepperButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value ?? ''}</Text>
      <TouchableOpacity {...buttonA11y()} style={styles.stepperButton} disabled={!editable} onPress={() => onChange(base + delta)}>
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
        <TouchableOpacity {...buttonA11y()} key={n} disabled={!editable} onPress={() => onChange(n === value ? 0 : n)}>
          <Text style={[styles.star, n <= value && styles.starOn]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── color ────────────────────────────────────────────────────────────────────────────────────

const paletteOf = () => [theme.danger, theme.warning, '#fdd835', theme.success, theme.info, '#8e24aa', '#6d4c41', '#546e7a', '#000000', theme.white];

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
          {paletteOf().map((c) => (
            <TouchableOpacity {...buttonA11y()} key={c} style={[styles.colorOption, { backgroundColor: c }]} onPress={() => onChange(c)} />
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
          <TouchableOpacity {...buttonA11y()} style={styles.imageButton} onPress={() => void pick()}>
            <Text style={styles.imageButtonText}>{value ? 'Replace' : 'Upload'}</Text>
          </TouchableOpacity>
          {!!value && (
            <TouchableOpacity {...buttonA11y()} style={styles.imageButton} onPress={() => onChange('')}>
              <Text style={styles.imageDeleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * `@FileUpload`: picks a file and commits it as a DATA URI (the field's wire contract — no upload
 * endpoint). On the web build the browser's own file picker, honouring `accept`; on a device the
 * photo library (pictures and videos) — this build carries no document picker, so an `accept`
 * that takes no media says so instead of offering a picker that could not satisfy it.
 */
export function FileUploadField({ value, accept, editable, onChange }: {
  value: string;
  accept?: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  const [name, setName] = useState<string | undefined>(undefined);
  const web = Platform.OS === 'web';
  const media = acceptsMedia(accept);
  const pick = async () => {
    if (web) {
      const doc = (globalThis as { document?: { createElement: (t: string) => any } }).document;
      if (!doc) return;
      const input = doc.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept;
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new (globalThis as unknown as { FileReader: new () => any }).FileReader();
        reader.onload = () => { setName(file.name); onChange(String(reader.result)); };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], base64: true, quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset) return;
    setName(asset.fileName ?? undefined);
    if (asset.base64) onChange(`data:${asset.mimeType ?? 'application/octet-stream'};base64,${asset.base64}`);
    else if (asset.uri) onChange(asset.uri);
  };
  const canPick = editable && (web || media);
  return (
    <View style={styles.fileField}>
      <Text style={value ? styles.fileName : styles.emptyText} numberOfLines={2}>{value ? fileValueSummary(value, name) : 'No file chosen'}</Text>
      {editable && (
        <View style={styles.imageButtons}>
          {canPick && (
            <TouchableOpacity {...buttonA11y({ label: value ? 'Replace file' : 'Choose a file' })} style={styles.imageButton} onPress={() => void pick()}>
              <Text style={styles.imageButtonText}>{value ? 'Replace…' : 'Choose a file…'}</Text>
            </TouchableOpacity>
          )}
          {!!value && (
            <TouchableOpacity {...buttonA11y({ label: 'Remove the file' })} style={styles.imageButton} onPress={() => { setName(undefined); onChange(''); }}>
              <Text style={styles.imageDeleteText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {editable && !canPick && (
        <Text style={styles.emptyText}>{`This app can attach photos and videos only; ${accept} files can be attached from the web version.`}</Text>
      )}
    </View>
  );
}

export function ImagePreview({ value }: { value: string }) {
  if (!value) return <Text style={styles.emptyText}>—</Text>;
  return <Image source={{ uri: value }} style={styles.imagePreview} resizeMode="contain" />;
}

// ── read-only text renderings ────────────────────────────────────────────────────────────────

/** A decimal TextInput that keeps the text being typed (see decimalDraft). */
export function DecimalInput({ text, onChangeText, ...rest }: React.ComponentProps<typeof TextInput> & { text: string; onChangeText: (t: string) => void }) {
  const [draft, setDraft] = useState(text);
  const shown = decimalDraft(draft, text);
  return (
    <TextInput
      {...rest}
      value={shown}
      onChangeText={(t) => {
        setDraft(t);
        onChangeText(t);
      }}
    />
  );
}

export function formatMoney(value: unknown): string {
  return moneyText(value);
}

export function LinkText({ value }: { value: string }) {
  if (!value) return <Text style={styles.emptyText}>—</Text>;
  return (
    <TouchableOpacity {...buttonA11y()} onPress={() => void openExternal(value)}>
      <Text style={styles.link}>{value}</Text>
    </TouchableOpacity>
  );
}

/** Markdown (MarkdownView: paragraphs, lists, tables, code…) or HTML/rich text (its tags dropped,
 *  its block structure kept as lines) for @Help texts and read-only content fields. */
export function RichText({ value, kind, onRouteLink }: { value: string; kind: 'markdown' | 'html' | 'richText'; onRouteLink?: (route: string) => void }) {
  // HTML keeps its structure (headings, bold, lists, links) through the same Markdown drawing
  return <MarkdownView value={kind === 'markdown' ? value : htmlToMarkdown(value)} onRouteLink={onRouteLink} />;
}

export function BadgeChip({ label, on }: { label: string; on: boolean }) {
  return (
    <View style={[styles.badgeChip, on && styles.badgeChipOn]}>
      <Text style={on ? styles.badgeChipOnText : styles.badgeChipText}>{label}</Text>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  radioGroup: { gap: 8 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  radioLabel: { fontSize: 14, color: theme.ink },
  checkGroup: { gap: 4 },
  checkGroupRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  checkGroupBox: { width: 20, height: 20, borderRadius: 3, borderWidth: 2, borderColor: theme.muted, alignItems: 'center', justifyContent: 'center' },
  checkGroupBoxOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  checkGroupBoxOff: { opacity: 0.5 },
  checkGroupTick: { color: theme.onPrimary, fontSize: 14, fontWeight: '700', lineHeight: 16 },
  listBox: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, overflow: 'hidden' },
  listBoxItem: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12, backgroundColor: theme.white },
  listBoxDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.divider },
  listBoxItemOn: { backgroundColor: theme.primaryContainer },
  listBoxCheck: { width: 16, color: theme.primary, fontWeight: '700' },
  listBoxLabelOn: { fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32, justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.white },
  chipOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { fontSize: 14, color: theme.ink },
  chipOnText: { fontSize: 14, color: theme.onFill },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderBound: { fontSize: 11, color: theme.faint },
  sliderTrack: { flex: 1, height: 28, justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, height: 4, borderRadius: 2, backgroundColor: theme.primary },
  sliderThumb: { position: 'absolute', marginLeft: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.primary },
  sliderValue: { minWidth: 32, textAlign: 'right', fontSize: 14, fontWeight: '600', color: theme.ink },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperButton: { width: 48, height: 48, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  stepperButtonText: { fontSize: 16, color: theme.ink },
  stepperValue: { minWidth: 40, textAlign: 'center', fontSize: 16, fontWeight: '600', color: theme.ink },
  starsRow: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 28, color: theme.border },
  starOn: { color: theme.warning },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSwatch: { width: 36, height: 36, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  colorOption: { width: 28, height: 28, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  textInput: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: theme.white, minHeight: 42 },
  imagePreview: { width: '100%', height: 160, borderRadius: theme.radiusSm, backgroundColor: theme.background },
  imageButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  imageButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background },
  imageButtonText: { fontSize: 14, color: theme.ink },
  imageDeleteText: { fontSize: 14, color: theme.danger },
  emptyText: { color: theme.faint },
  fileField: { gap: 4 },
  fileName: { fontSize: 14, color: theme.ink },
  link: { color: theme.primary, textDecorationLine: 'underline', fontSize: 14 },
  mdText: { fontSize: 14, color: theme.ink, lineHeight: 21 },
  badgeChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.divider },
  badgeChipOn: { backgroundColor: theme.successBg },
  badgeChipText: { fontSize: 12, color: theme.faint },
  badgeChipOnText: { fontSize: 12, color: theme.success, fontWeight: '600' },
}));
