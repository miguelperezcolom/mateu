/**
 * The pure half of the "Mateu Library Self-test" command (the Figma half is in code.ts): which
 * variants of an entry are instantiated, which library component goes into each slot, which value
 * each property is set to, and how the per-entry results add up. Tested with `node --test`.
 */

// `.ts` + `import type`: node --test runs this file with type stripping (no bundler in between)
import { BUTTON } from './plan.ts';
import type { EntryPlan, PropertyPlan, SlotPlan } from './plan.ts';

export const TEXT_FIELD = 'Mateu/Field/TextField';
export const SELF_TEST_PAGE = 'Mateu · Self-test';
/** Slots meant for actions when they declare no preferred values. */
const ACTION_SLOT_NAMES = new Set(['toolbar', 'buttons', 'actions']);

/** The default variant (first value of every axis) and one more per non-default axis value. */
export function variantCombosToTest(axes: Record<string, string[]>): Record<string, string>[] {
  const names = Object.keys(axes);
  if (names.length === 0) return [{}];
  const base: Record<string, string> = {};
  for (const n of names) base[n] = axes[n][0];
  const out = [base];
  for (const n of names) {
    for (const v of axes[n].slice(1)) out.push({ ...base, [n]: v });
  }
  return out;
}

/** The library component appended to a slot: its preferred value, a Button for action slots, else a TextField. */
export function childForSlot(slot: SlotPlan): string | null {
  if (slot.settings.maxChildren === 0) return null;
  if (slot.preferred.length > 0) return slot.preferred[0];
  return ACTION_SLOT_NAMES.has(slot.name) ? BUTTON : TEXT_FIELD;
}

/** A distinctive value to set, and to read back. */
export function valueForProperty(p: PropertyPlan): string | boolean {
  return p.type === 'BOOLEAN' ? !(p.defaultValue as boolean) : `selftest-${p.name}`;
}

/** A variant value other than the instance's current one, or null when the axis has one value. */
export function otherVariantValue(values: string[], current: string): string | null {
  return values.find((v) => v !== current) ?? null;
}

export type CheckKind = 'slot' | 'property' | 'variant' | 'config';

export interface Check {
  entry: string;
  /** The variant the instance was made of (`theme=danger, slim=false`), '' without variants. */
  variant: string;
  kind: CheckKind;
  /** The slot, property or axis checked. */
  target: string;
  ok: boolean;
  message?: string;
}

export interface EntryResult {
  entry: string;
  instances: number;
  slotsOk: number;
  slotsTotal: number;
  propsOk: number;
  propsTotal: number;
  failures: string[];
}

export interface Report {
  entries: EntryResult[];
  totals: { entries: number; instances: number; checks: number; failed: number; slotsOk: number; slotsTotal: number; propsOk: number; propsTotal: number };
  /** Slot appends refused because the slot belongs to an instance — an API limitation, not a library bug. */
  instanceSlotBlocked: number;
}

/** Whether a failure message says Figma refused to edit an instance's slot (some API versions do). */
export function isInstanceSlotBlock(message: string | undefined): boolean {
  return !!message && /instance/i.test(message) && /(slot|append|cannot|not allowed|read.?only)/i.test(message);
}

export function aggregate(checks: Check[], instancesPerEntry: Record<string, number>): Report {
  const byEntry = new Map<string, EntryResult>();
  const row = (entry: string) => {
    let r = byEntry.get(entry);
    if (!r) {
      r = { entry, instances: instancesPerEntry[entry] ?? 0, slotsOk: 0, slotsTotal: 0, propsOk: 0, propsTotal: 0, failures: [] };
      byEntry.set(entry, r);
    }
    return r;
  };
  for (const name of Object.keys(instancesPerEntry)) row(name);
  let failed = 0;
  let blocked = 0;
  for (const c of checks) {
    const r = row(c.entry);
    if (c.kind === 'slot') {
      r.slotsTotal++;
      if (c.ok) r.slotsOk++;
    } else {
      r.propsTotal++;
      if (c.ok) r.propsOk++;
    }
    if (!c.ok) {
      failed++;
      if (c.kind === 'slot' && isInstanceSlotBlock(c.message)) blocked++;
      const where = c.variant ? ` [${c.variant}]` : '';
      r.failures.push(`${c.kind} ${c.target}${where}: ${c.message ?? 'failed'}`);
    }
  }
  const entries = [...byEntry.values()];
  const sum = (f: (r: EntryResult) => number) => entries.reduce((n, r) => n + f(r), 0);
  return {
    entries,
    totals: {
      entries: entries.length,
      instances: sum((r) => r.instances),
      checks: checks.length,
      failed,
      slotsOk: sum((r) => r.slotsOk),
      slotsTotal: sum((r) => r.slotsTotal),
      propsOk: sum((r) => r.propsOk),
      propsTotal: sum((r) => r.propsTotal),
    },
    instanceSlotBlocked: blocked,
  };
}

/** The variant string Figma names a variant component with (`a=1, b=2`), axes in contract order. */
export function variantName(combo: Record<string, string>): string {
  return Object.entries(combo).map(([k, v]) => `${k}=${v}`).join(', ');
}

/** Every check the self-test will run on one instance of an entry (for counting and tests). */
export function plannedChecks(entry: any, plan: EntryPlan): { slots: number; properties: number; variants: number } {
  const axes = entry.variants ?? {};
  return {
    slots: plan.slots.filter((s) => childForSlot(s) !== null).length,
    properties: plan.properties.length,
    variants: Object.values(axes).filter((v: any) => v.length > 1).length,
  };
}
