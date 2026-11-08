/**
 * Mateu Library Generator — builds the Mateu component library (vaadin/Lumo flavor) inside Figma
 * from ../contract.json, the single source of truth of the design-to-code pipeline:
 *
 *   contract.json ──► this plugin ──► Figma library ──► designer composes screens
 *                ├──► ../to-yaml (specs/ui YAML) ◄── Figma REST API (reads the composed screens)
 *                └──► modux figma importer      ◄── Figma REST API
 *
 * Every contract entry becomes a Figma COMPONENT (or a COMPONENT SET when it declares variant
 * axes), named exactly `Mateu/<Category>/<Name>` with variant properties named exactly like the
 * Mateu annotation/record parameters. Non-visual config (fieldId, actionId, route, required…)
 * and the editable texts (Label, Title…) are COMPONENT PROPERTIES, edited in Figma's properties
 * panel; every named `slot` is a NATIVE slot, so designers drag library instances into it (see
 * ./plan.ts). Only a prop Figma refuses as a property falls back to the old subtle `#config` text
 * layer (`key=value; key2=value2`), which the importers still read.
 *
 * The drawing is data-driven: each entry carries a compact `sketch` (a list of primitives) that
 * the generic renderer below turns into auto-layout frames. Regenerating the library after the
 * catalog grows = re-running this plugin (existing pages are replaced).
 */

import contract from "../../contract.json";
import { planEntry, EntryPlan, SlotPlan } from "./plan";

type Sketch = any;
type Entry = any;

const LUMO = (contract as any).lumo;

// ── helpers ──────────────────────────────────────────────────────────────────

function hex(color: string): RGB {
  const v = color.replace('#', '');
  return {
    r: parseInt(v.substring(0, 2), 16) / 255,
    g: parseInt(v.substring(2, 4), 16) / 255,
    b: parseInt(v.substring(4, 6), 16) / 255,
  };
}

function solid(color: string): SolidPaint {
  return { type: 'SOLID', color: hex(color) };
}

const FONT_R: FontName = { family: LUMO.fontFamily, style: 'Regular' };
const FONT_B: FontName = { family: LUMO.fontFamily, style: 'Bold' };
const FONT_M: FontName = { family: LUMO.fontFamily, style: 'Medium' };

function textNode(content: string, opts: {
  size?: number, bold?: boolean, medium?: boolean, italic?: boolean, color?: string, name?: string,
} = {}): TextNode {
  const t = figma.createText();
  t.fontName = opts.bold ? FONT_B : opts.medium ? FONT_M : FONT_R;
  t.characters = content;
  t.fontSize = opts.size ?? LUMO.sizeS;
  t.fills = [solid(opts.color ?? LUMO.body)];
  if (opts.name) t.name = opts.name;
  return t;
}

function frameNode(opts: {
  dir?: 'HORIZONTAL' | 'VERTICAL', gap?: number, pad?: number, bg?: string | null,
  radius?: number, stroke?: string | null, name?: string, spread?: boolean, center?: boolean, right?: boolean,
} = {}): FrameNode {
  const f = figma.createFrame();
  f.layoutMode = opts.dir ?? 'VERTICAL';
  f.itemSpacing = opts.gap ?? 8;
  const pad = opts.pad ?? 0;
  f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = pad;
  f.fills = opts.bg === null ? [] : [solid(opts.bg ?? LUMO.base)];
  if (opts.bg === undefined) f.fills = [];
  f.cornerRadius = opts.radius ?? 0;
  if (opts.stroke) {
    f.strokes = [solid(opts.stroke)];
    f.strokeWeight = 1;
  }
  if (opts.name) f.name = opts.name;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  if (opts.spread) f.primaryAxisAlignItems = 'SPACE_BETWEEN';
  if (opts.center) f.counterAxisAlignItems = 'CENTER';
  if (opts.right) f.primaryAxisAlignItems = 'MAX';
  if (f.layoutMode === 'HORIZONTAL') f.counterAxisAlignItems = 'CENTER';
  return f;
}

// theme resolution for tinted sketches: an explicit theme, or the entry's current variant value
function themeColors(themeName: string | undefined) {
  const themes = LUMO.themes;
  return themes[themeName ?? 'info'] ?? themes.info;
}

// ── sketch primitives ────────────────────────────────────────────────────────

function renderItem(item: Sketch, ctx: { variants: Record<string, string> }): SceneNode {
  const theme = item.theme ?? (item.tint === 'theme' || item.themeBadge || item.inkFromTheme
    ? ctx.variants['theme'] : undefined);
  const colors = themeColors(theme);
  switch (item.t) {
    case 'title': {
      const size = item.sizeFromVariant ? sizeFor(ctx.variants[item.sizeFromVariant]) : (item.size ?? LUMO.sizeM);
      return textNode(item.text ?? 'Título', { size, bold: true, color: item.color === 'primary' ? LUMO.primary : item.color, name: item.layer ?? item.text });
    }
    case 'label':
      return textNode(item.text ?? 'Label', { size: LUMO.sizeXs + 1, color: LUMO.secondary, name: item.layer ?? item.text });
    case 'value':
      return textNode(item.text ?? 'Valor', { size: LUMO.sizeS, medium: true, name: item.layer ?? item.text });
    case 'text': {
      const size = item.sizeFromVariant ? sizeFor(ctx.variants[item.sizeFromVariant]) : (item.size ?? LUMO.sizeS);
      const color = item.inkFromTheme ? colors.ink : (item.color === 'secondary' ? LUMO.secondary : item.color === 'primary' ? LUMO.primary : item.color);
      const t = textNode(item.text ?? 'Texto', { size, bold: item.bold, italic: item.italic, color, name: item.layer ?? item.text });
      if (item.underline) t.textDecoration = 'UNDERLINE';
      return t;
    }
    case 'chip': {
      const c = themeColors(item.theme);
      const f = frameNode({ dir: 'HORIZONTAL', pad: 4, gap: 4, bg: c.bg, radius: 999 });
      f.paddingLeft = f.paddingRight = 8;
      f.appendChild(textNode(item.text ?? 'chip', { size: LUMO.sizeXs, medium: true, color: c.ink, name: item.layer ?? item.text }));
      return f;
    }
    case 'fieldbox': {
      const f = frameNode({ dir: 'HORIZONTAL', pad: 8, bg: LUMO.contrast10, radius: LUMO.radiusM, spread: !!item.icon });
      f.resize(item.w ?? 180, Math.max(item.h ?? 32, 32));
      f.primaryAxisSizingMode = 'FIXED';
      f.counterAxisSizingMode = 'FIXED';
      f.appendChild(textNode(item.text ?? '', { size: LUMO.sizeS, color: LUMO.secondary, name: item.layer ?? item.text }));
      if (item.icon) f.appendChild(textNode(item.icon, { size: LUMO.sizeS, color: LUMO.secondary }));
      return f;
    }
    case 'hr': {
      const r = figma.createRectangle();
      r.resize(item.w ?? 200, 1);
      r.fills = [solid(LUMO.contrast20)];
      r.name = 'hr';
      return r;
    }
    case 'dot': {
      const size = item.size ?? (item.themeBadge ? 18 : 14);
      const f = frameNode({ dir: 'HORIZONTAL', bg: item.hollow ? LUMO.base : item.themeBadge ? colors.badge : item.color === 'primary' ? LUMO.primary : LUMO.contrast20, radius: item.square ? 3 : 999, center: true });
      f.resize(size, size);
      f.primaryAxisSizingMode = 'FIXED';
      f.counterAxisSizingMode = 'FIXED';
      f.primaryAxisAlignItems = 'CENTER';
      if (item.hollow) { f.strokes = [solid(LUMO.contrast20)]; f.strokeWeight = 1; }
      if (item.text) f.appendChild(textNode(item.text, { size: size * 0.55, bold: true, color: '#ffffff', name: item.layer ?? item.text }));
      return f;
    }
    case 'bullets': {
      const col = frameNode({ dir: 'VERTICAL', gap: 4 });
      for (const it of item.items ?? []) {
        const row = frameNode({ dir: 'HORIZONTAL', gap: 6 });
        row.appendChild(textNode('•', { size: LUMO.sizeS, color: LUMO.secondary }));
        row.appendChild(textNode(it, { size: LUMO.sizeS, name: it }));
        col.appendChild(row);
      }
      col.name = 'bullets';
      return col;
    }
    case 'bar': {
      const w = item.w ?? 220;
      const outer = frameNode({ dir: 'HORIZONTAL', bg: item.color ?? LUMO.contrast10, radius: 4 });
      outer.resize(w, 8);
      outer.primaryAxisSizingMode = 'FIXED';
      outer.counterAxisSizingMode = 'FIXED';
      if (!item.color) {
        const fill = figma.createRectangle();
        fill.resize(Math.max(4, w * (item.value ?? 0.5)), 8);
        fill.fills = [solid(LUMO.primary)];
        fill.cornerRadius = 4;
        outer.appendChild(fill);
      }
      if (item.knob) {
        const k = figma.createEllipse();
        k.resize(14, 14);
        k.fills = [solid(LUMO.primary)];
        outer.appendChild(k);
      }
      outer.name = 'bar';
      return outer;
    }
    case 'stepper': {
      const row = frameNode({ dir: 'HORIZONTAL', gap: 0 });
      const steps: string[] = item.steps ?? [];
      steps.forEach((label, i) => {
        const cell = frameNode({ dir: 'VERTICAL', gap: 4, center: true });
        const isDone = i < (item.current ?? 0);
        const isCurrent = i === (item.current ?? 0);
        const d = frameNode({ dir: 'HORIZONTAL', bg: isDone ? LUMO.primary : LUMO.base, radius: 999, center: true });
        d.resize(24, 24);
        d.primaryAxisSizingMode = 'FIXED';
        d.counterAxisSizingMode = 'FIXED';
        d.primaryAxisAlignItems = 'CENTER';
        d.strokes = [solid(isCurrent || isDone ? LUMO.primary : LUMO.contrast20)];
        d.strokeWeight = 2;
        d.appendChild(textNode(isDone ? '✓' : String(i + 1), { size: 11, bold: true, color: isDone ? '#ffffff' : isCurrent ? LUMO.primary : LUMO.secondary }));
        cell.appendChild(d);
        cell.appendChild(textNode(label, { size: LUMO.sizeXs, medium: isCurrent, color: isCurrent ? LUMO.body : LUMO.secondary, name: label }));
        cell.paddingLeft = cell.paddingRight = 18;
        row.appendChild(cell);
      });
      row.name = 'stepper';
      return row;
    }
    case 'table': {
      const cols = item.cols ?? 3, rows = item.rows ?? 3;
      const grid = frameNode({ dir: 'VERTICAL', gap: 1, bg: LUMO.contrast20, radius: LUMO.radiusM, stroke: LUMO.contrast20 });
      for (let r = 0; r < rows; r++) {
        const row = frameNode({ dir: 'HORIZONTAL', gap: 1 });
        for (let c = 0; c < cols; c++) {
          const cell = frameNode({ dir: 'HORIZONTAL', pad: 6, bg: item.heat ? heatColor(r, c) : r === 0 && !item.gantt ? LUMO.contrast10 : LUMO.base });
          cell.resize(item.gantt && c > 0 ? 44 : 64, 24);
          cell.primaryAxisSizingMode = 'FIXED';
          cell.counterAxisSizingMode = 'FIXED';
          if (r === 0 && !item.heat && !item.gantt) cell.appendChild(textNode('Col', { size: 10, medium: true, color: LUMO.secondary }));
          if (item.gantt && c === Math.min(r + 1, cols - 2)) {
            const barNode = figma.createRectangle();
            barNode.resize(36, 10);
            barNode.fills = [solid(LUMO.primary)];
            barNode.cornerRadius = 3;
            cell.appendChild(barNode);
          }
          row.appendChild(cell);
        }
        grid.appendChild(row);
      }
      grid.name = 'table';
      return grid;
    }
    case 'imagebox': {
      const f = frameNode({ dir: 'HORIZONTAL', bg: LUMO.contrast10, radius: LUMO.radiusM, center: true });
      f.resize(item.w ?? 160, item.h ?? 90);
      f.primaryAxisSizingMode = 'FIXED';
      f.counterAxisSizingMode = 'FIXED';
      f.primaryAxisAlignItems = 'CENTER';
      f.appendChild(textNode(item.label ?? '🖼', { size: 22 }));
      f.name = 'imagebox';
      return f;
    }
    case 'button': {
      const secondary = item.secondary || (item.styleFromVariant && ctx.variants[item.styleFromVariant] !== 'primary');
      const bg = item.themeBadge ? colors.badge : secondary ? LUMO.contrast10 : LUMO.primary;
      const ink = secondary && !item.themeBadge ? LUMO.body : '#ffffff';
      const f = frameNode({ dir: 'HORIZONTAL', pad: 8, bg, radius: item.pill ? 999 : LUMO.radiusM, center: true });
      f.paddingLeft = f.paddingRight = 14;
      f.appendChild(textNode(item.text ?? 'Botón', { size: LUMO.sizeS, medium: true, color: ink, name: item.layer ?? item.text }));
      f.name = 'button';
      return f;
    }
    case 'slot': {
      const f = frameNode({ dir: 'VERTICAL', bg: '#fafafa', radius: LUMO.radiusM, center: true, stroke: LUMO.contrast20 });
      f.resize(item.w ?? 380, item.h ?? 80);
      // fixed width, but it GROWS with what is dropped into it (never clips the content)
      f.primaryAxisSizingMode = 'AUTO';
      f.counterAxisSizingMode = 'FIXED';
      f.minHeight = item.h ?? 80;
      f.primaryAxisAlignItems = 'CENTER';
      f.strokeWeight = 1;
      f.dashPattern = [4, 4];
      // A named slot is the frame `slot:<name>`, made a NATIVE slot by linkSlots (designers drag
      // instances into it); its caption is a `#`-named layer, never read back as content.
      f.appendChild(textNode(item.label ?? item.name ?? 'contenido', { size: LUMO.sizeXs, color: LUMO.secondary, name: '#placeholder' }));
      f.name = item.name ? `slot:${item.name}` : 'slot';
      return f;
    }
    case 'tile': {
      // A small outlined card (KPI tile, wizard step, result card, dashboard panel). A trailing
      // token carrying a digit ("Revenue 1.2M€", "Orders 3,421") is drawn as the tile's VALUE
      // under a muted label; anything else is a single medium caption.
      const f = frameNode({ dir: 'VERTICAL', gap: 4, pad: 12, bg: LUMO.base, radius: LUMO.radiusM, stroke: LUMO.contrast20 });
      f.resize(item.w ?? 120, item.h ?? 56);
      f.primaryAxisSizingMode = item.h ? 'FIXED' : 'AUTO';
      f.counterAxisSizingMode = 'FIXED';
      const text: string = item.text ?? 'Tile';
      const cut = text.lastIndexOf(' ');
      const tail = cut > 0 ? text.substring(cut + 1) : '';
      if (/\d/.test(tail)) {
        f.appendChild(textNode(text.substring(0, cut), { size: LUMO.sizeXs, color: LUMO.secondary, name: 'label' }));
        f.appendChild(textNode(tail, { size: LUMO.sizeL, bold: true, name: 'value' }));
      } else {
        f.appendChild(textNode(text, { size: LUMO.sizeS, medium: true, name: text }));
      }
      f.name = 'tile';
      return f;
    }
    case 'listrow': {
      const row = frameNode({ dir: 'HORIZONTAL', gap: 8, pad: 8, spread: !!item.chip });
      row.strokes = [solid(LUMO.contrast10)];
      row.strokeWeight = 1;
      if (item.icon) row.appendChild(textNode(item.icon, { size: 15 }));
      const body = frameNode({ dir: 'VERTICAL', gap: 2 });
      body.appendChild(textNode(item.title ?? 'Título', { size: LUMO.sizeS, medium: true, name: item.title }));
      if (item.desc) body.appendChild(textNode(item.desc, { size: LUMO.sizeXs, color: LUMO.secondary, name: item.desc }));
      row.appendChild(body);
      if (item.chip) {
        const c = themeColors('info');
        const chip = frameNode({ dir: 'HORIZONTAL', pad: 4, bg: c.bg, radius: 999 });
        chip.paddingLeft = chip.paddingRight = 8;
        chip.appendChild(textNode(item.chip, { size: LUMO.sizeXs, medium: true, color: c.ink, name: item.chip }));
        row.appendChild(chip);
      }
      row.name = 'listrow';
      return row;
    }
    case 'row':
    case 'col': {
      const isRow = item.t === 'row';
      const tinted = item.tint === 'theme' || (typeof item.tint === 'string' && item.tint.startsWith('#')) || (item.tint && LUMO.themes[item.tint]);
      const bg = item.bg ?? (item.tint === 'theme' ? colors.bg : LUMO.themes[item.tint]?.bg ?? (typeof item.tint === 'string' && item.tint.startsWith('#') ? item.tint : undefined));
      const slim = ctx.variants['slim'] === 'true';
      const f = frameNode({
        dir: isRow ? 'HORIZONTAL' : 'VERTICAL',
        gap: slim ? 5 : 8,
        pad: slim && tinted ? 4 : item.pad ?? 0,
        bg: bg,
        radius: tinted ? LUMO.radiusM : 0,
        spread: item.spread,
        center: item.center,
        right: item.right,
      });
      for (const child of item.items ?? []) f.appendChild(renderItem(child, ctx));
      return f;
    }
    default:
      return textNode(`?${item.t}`, {});
  }
}

function sizeFor(variantValue: string | undefined): number {
  switch (variantValue) {
    case 'xl': return LUMO.sizeXl;
    case 'l': return LUMO.sizeL;
    case 's': return LUMO.sizeS;
    case 'xs': return LUMO.sizeXs;
    default: return LUMO.sizeM;
  }
}

function heatColor(r: number, c: number): string {
  const shades = ['#e3f0fb', '#b3d2f2', '#7fb0e6', '#4285d3'];
  return shades[(r * 3 + c) % shades.length];
}

// ── component building ───────────────────────────────────────────────────────

function cartesian(axes: Record<string, string[]>): Record<string, string>[] {
  let combos: Record<string, string>[] = [{}];
  for (const [axis, values] of Object.entries(axes)) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) for (const value of values) next.push({ ...combo, [axis]: value });
    combos = next;
  }
  return combos;
}

function buildComponent(entry: Entry, variants: Record<string, string>): ComponentNode {
  const comp = figma.createComponent();
  comp.layoutMode = 'VERTICAL';
  comp.itemSpacing = 8;
  comp.paddingTop = comp.paddingBottom = comp.paddingLeft = comp.paddingRight = entry.card ? 14 : 10;
  comp.fills = [solid(LUMO.base)];
  comp.cornerRadius = LUMO.radiusL;
  if (entry.card) {
    comp.strokes = [solid(LUMO.contrast20)];
    comp.strokeWeight = 1;
  }
  comp.primaryAxisSizingMode = 'AUTO';
  comp.counterAxisSizingMode = 'AUTO';
  const ctx = { variants };
  for (const item of entry.sketch ?? []) comp.appendChild(renderItem(item, ctx));
  const variantEntries = Object.entries(variants);
  comp.name = variantEntries.length > 0
    ? variantEntries.map(([k, v]) => `${k}=${v}`).join(', ')
    : entry.name;
  return comp;
}

// ── component properties & native slots ──────────────────────────────────────

/** What the run did, reported when it ends (and what fell back to the old conventions). */
const stats = { properties: 0, textBindings: 0, slots: 0, preferred: 0, configFallbacks: 0, slotFallbacks: 0 };
/** Slots whose preferred values name components that may be built later in the run. */
const pendingPreferred: { owner: ComponentNode | ComponentSetNode, propertyId: string, slot: SlotPlan }[] = [];
/** Contract name → the built component (or component set), for preferred values. */
const built = new Map<string, ComponentNode | ComponentSetNode>();

function findAll(root: BaseNode, test: (n: SceneNode) => boolean): SceneNode[] {
  const out: SceneNode[] = [];
  const walk = (n: BaseNode) => {
    for (const c of (n as ChildrenMixin).children ?? []) {
      if (test(c)) out.push(c);
      walk(c);
    }
  };
  walk(root);
  return out;
}

/**
 * Adds the entry's properties and slots to `owner` — the component, or the COMPONENT SET for an
 * entry with variants (Figma keeps non-variant properties on the set; each variant's layers then
 * reference the set's property) — and binds the layers of every component in `variants`.
 */
function applyPlan(owner: ComponentNode | ComponentSetNode, variants: ComponentNode[], plan: EntryPlan) {
  const fallback: string[] = [];
  for (const p of plan.properties) {
    let id: string;
    try {
      id = owner.addComponentProperty(p.name, p.type, p.defaultValue);
    } catch (e) {
      if (!p.layer) fallback.push(p.param); // a texts layer is still read off the layer itself
      continue;
    }
    stats.properties++;
    if (!p.layer) continue;
    for (const comp of variants) {
      for (const t of findAll(comp, (n) => n.type === 'TEXT' && n.name === p.layer)) {
        try {
          t.componentPropertyReferences = { characters: id };
          stats.textBindings++;
        } catch (e) { /* the layer keeps working as a plain text layer */ }
      }
    }
    // the property's default is the layer's own text, so an untouched instance reads unchanged
    const first = variants.map((c) => findAll(c, (n) => n.type === 'TEXT' && n.name === p.layer)[0]).find(Boolean) as TextNode | undefined;
    if (first && first.characters !== p.defaultValue) {
      try { owner.editComponentProperty(id, { defaultValue: first.characters }); } catch (e) { /* keep */ }
    }
  }
  for (const slot of plan.slots) linkSlot(owner, variants, slot);
  if (fallback.length > 0) {
    stats.configFallbacks++;
    for (const comp of variants) {
      comp.appendChild(textNode(fallback.map((p) => `${p}=`).join('; '), { size: 9, color: '#b0b0b0', name: '#config' }));
    }
  }
}

/**
 * Makes every variant's `slot:<name>` frame a native slot: one SLOT property on the owner, each
 * frame linked to it (`componentPropertyReferences.slotContentId`). A component without variants
 * that refuses the link gets a fresh `createSlot()` node in the frame's place instead. When neither
 * works the frame stays a plain `slot:<name>` frame — the converters read it either way.
 */
function linkSlot(owner: ComponentNode | ComponentSetNode, variants: ComponentNode[], slot: SlotPlan) {
  const frameName = `slot:${slot.name}`;
  const options = { description: slot.description, slotSettings: slot.settings };
  let id: string | null = null;
  try {
    id = owner.addComponentProperty(slot.property, 'SLOT', '', options);
  } catch (e) { id = null; }
  let linked = 0;
  for (const comp of variants) {
    for (const frame of findAll(comp, (n) => n.type === 'FRAME' && n.name === frameName) as FrameNode[]) {
      if (id) {
        try {
          (frame as any).componentPropertyReferences = { slotContentId: id };
          linked++;
          continue;
        } catch (e) { /* try createSlot below */ }
      }
      if (owner.type === 'COMPONENT' && replaceWithCreatedSlot(owner, frame, slot, id)) linked++;
    }
  }
  if (linked === 0) {
    stats.slotFallbacks++;
    if (id) { try { owner.deleteComponentProperty(id); } catch (e) { /* keep */ } }
    return;
  }
  stats.slots++;
  const propertyId = id ?? slotPropertyOf(owner, slot.property);
  if (slot.preferred.length > 0 && propertyId) pendingPreferred.push({ owner, propertyId, slot });
}

/** `createSlot()` (which also creates its own SLOT property), styled like the frame it replaces. */
function replaceWithCreatedSlot(comp: ComponentNode, frame: FrameNode, slot: SlotPlan, unusedId: string | null): boolean {
  try {
    if (unusedId) { try { comp.deleteComponentProperty(unusedId); } catch (e) { /* keep */ } }
    const node = comp.createSlot();
    const parent = frame.parent as (BaseNode & ChildrenMixin);
    parent.insertChild(parent.children.indexOf(frame), node);
    node.name = frame.name;
    node.layoutMode = frame.layoutMode;
    node.resize(frame.width, frame.height);
    node.primaryAxisSizingMode = frame.primaryAxisSizingMode;
    node.counterAxisSizingMode = frame.counterAxisSizingMode;
    node.minHeight = frame.minHeight;
    node.primaryAxisAlignItems = frame.primaryAxisAlignItems;
    node.counterAxisAlignItems = frame.counterAxisAlignItems;
    node.fills = frame.fills;
    node.strokes = frame.strokes;
    node.strokeWeight = frame.strokeWeight;
    node.dashPattern = frame.dashPattern;
    node.cornerRadius = frame.cornerRadius;
    for (const child of [...frame.children]) node.appendChild(child);
    frame.remove();
    const ref = ((node as any).componentPropertyReferences ?? {}).slotContentId as string | undefined;
    if (ref) {
      comp.editComponentProperty(ref, { name: slot.property, description: slot.description, slotSettings: slot.settings });
    }
    return true;
  } catch (e) {
    return false;
  }
}

function slotPropertyOf(owner: ComponentNode | ComponentSetNode, name: string): string | null {
  for (const [key, def] of Object.entries(owner.componentPropertyDefinitions)) {
    if (def.type === 'SLOT' && key.replace(/#.*$/, '') === name) return key;
  }
  return null;
}

/** Preferred values (Buttons first in a toolbar) once every component of the run exists. */
function applyPreferredValues() {
  for (const { owner, propertyId, slot } of pendingPreferred) {
    const values = slot.preferred
      .map((name) => built.get(name))
      .filter((n): n is ComponentNode | ComponentSetNode => !!n)
      .map((n) => ({ type: n.type, key: n.key } as InstanceSwapPreferredValue));
    if (values.length === 0) continue;
    try {
      owner.editComponentProperty(propertyId, { preferredValues: values });
      stats.preferred++;
    } catch (e) { /* the slot still takes anything */ }
  }
}

async function buildLibrary() {
  await figma.loadFontAsync(FONT_R);
  await figma.loadFontAsync(FONT_B);
  await figma.loadFontAsync(FONT_M);

  const byCategory = new Map<string, Entry[]>();
  for (const entry of (contract as any).components) {
    const category = entry.name.split('/')[1];
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(entry);
  }

  for (const [category, entries] of byCategory) {
    const pageName = `Mateu · ${category}`;
    let page = figma.root.children.find(p => p.name === pageName) as PageNode | undefined;
    if (page) {
      await page.loadAsync();
      for (const child of [...page.children]) child.remove();
    } else {
      page = figma.createPage();
      page.name = pageName;
    }
    await figma.setCurrentPageAsync(page);

    let y = 0;
    for (const entry of entries) {
      const axes = entry.variants ?? {};
      const combos = cartesian(axes);
      if (combos.length === 1 && Object.keys(axes).length === 0) {
        const comp = buildComponent(entry, {});
        comp.x = 0; comp.y = y;
        page.appendChild(comp);
        applyPlan(comp, [comp], planEntry(entry));
        built.set(entry.name, comp);
        y += comp.height + 60;
      } else {
        const comps = combos.map(combo => buildComponent(entry, combo));
        comps.forEach((c, i) => { c.x = (i % 4) * 420; c.y = y + Math.floor(i / 4) * 160; });
        const set = figma.combineAsVariants(comps, page);
        set.name = entry.name;
        set.layoutMode = 'HORIZONTAL';
        set.layoutWrap = 'WRAP';
        set.itemSpacing = 24;
        set.counterAxisSpacing = 24;
        set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
        set.x = 0; set.y = y;
        applyPlan(set, comps, planEntry(entry));
        built.set(entry.name, set);
        y += set.height + 60;
      }
    }
  }
  applyPreferredValues();

  const fallbacks = stats.configFallbacks + stats.slotFallbacks > 0
    ? ` — fallbacks: ${stats.configFallbacks} #config, ${stats.slotFallbacks} plain slot frames`
    : '';
  figma.notify(`Mateu library generated: ${(contract as any).components.length} components, ${stats.properties} properties, ${stats.slots} native slots ✔${fallbacks}`, { timeout: 10000 });
  console.log('Mateu library generator', JSON.stringify(stats));
  figma.closePlugin();
}

buildLibrary();
