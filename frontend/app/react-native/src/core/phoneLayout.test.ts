import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactRail, declaresWrapPoint, formRowColumns, isPhoneWidth, splitCreateAction, wizardRailIndex } from './phoneLayout.ts';

test('a form row is ONE column on a phone, the declared columns from a tablet up', () => {
  // iPhone 15 (393pt), a small Android (360dp), a phone in landscape still < 600
  assert.equal(formRowColumns(4, 393), 1);
  assert.equal(formRowColumns(2, 360), 1);
  assert.equal(formRowColumns(3, 599), 1);
  // tablets keep the section's columns
  assert.equal(formRowColumns(4, 600), 4);
  assert.equal(formRowColumns(2, 820), 2);
  // nonsense in, one column out
  assert.equal(formRowColumns(0, 1024), 1);
  assert.equal(formRowColumns(Number.NaN, 1024), 1);
  // an unmeasured window (0) is not treated as a phone
  assert.equal(isPhoneWidth(0), false);
  assert.equal(isPhoneWidth(393), true);
});

test('the crud listing lifts its create action (`new`) out of the toolbar into the FAB', () => {
  // the exact Products toolbar: a bulk action, New, Delete
  const toolbar = [
    { actionId: 'action-on-row-doSomethingOnRows', label: 'Do something on rows' },
    { actionId: 'new', label: 'New' },
    { actionId: 'delete', label: 'Delete', color: 'error' },
  ];
  const { create, rest } = splitCreateAction(toolbar);
  assert.equal(create?.label, 'New');
  assert.deepEqual(rest.map((b) => b.actionId), ['action-on-row-doSomethingOnRows', 'delete']);
  // a legacy button carrying only `id`
  assert.equal(splitCreateAction([{ id: 'new' }]).create?.id, 'new');
  // `create` is the creation FORM's save — never a FAB; arbitrary buttons stay in the toolbar
  const form = splitCreateAction([{ actionId: 'create', label: 'Save' }, { actionId: 'export' }]);
  assert.equal(form.create, null);
  assert.equal(form.rest.length, 2);
  assert.deepEqual(splitCreateAction(undefined), { create: null, rest: [] });
});

// the wire of /branching-wizard (Wizard.progressRail): [form, rail] in a HorizontalLayout
const rail = (steps: { title: string; status: string }[]) => ({
  type: 'ClientSide',
  metadata: { type: 'VerticalLayout' },
  style: 'flex: 0 0 15rem; border-left: 1px solid;',
  children: [
    { type: 'ClientSide', metadata: { type: 'Text', text: '1 | 2' }, children: [] },
    { type: 'ClientSide', metadata: { type: 'ProgressSteps', vertical: true, resultTitle: 'Result', steps }, children: [] },
  ],
});
const form = { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [] };

test('a wizard rail row is recognised by its VERTICAL ProgressSteps', () => {
  const r = rail([{ title: 'Account', status: 'current' }, { title: 'Plan', status: 'upcoming' }]);
  assert.equal(wizardRailIndex([form, r]), 1);
  assert.equal(wizardRailIndex([form, form]), -1);
  // a horizontal ProgressSteps (STEPS style) is not a rail
  const steps = { metadata: { type: 'ProgressSteps', vertical: false, steps: [] }, children: [] };
  assert.equal(wizardRailIndex([steps, form]), -1);
  assert.equal(wizardRailIndex(undefined), -1);
});

test('on a phone the rail collapses to "Step N of M · Title" above the form', () => {
  const first = compactRail(rail([
    { title: 'Account type', status: 'current' },
    { title: 'Company', status: 'upcoming' },
    { title: 'Plan', status: 'upcoming' },
    { title: 'Confirm', status: 'upcoming' },
  ]));
  assert.deepEqual(first, { text: 'Step 1 of 4 · Account type', progress: 0.25 });
  const second = compactRail(rail([
    { title: 'Account type', status: 'done' },
    { title: 'Company', status: 'current' },
  ]));
  assert.deepEqual(second, { text: 'Step 2 of 2 · Company', progress: 1 });
  // the result step: every step done → the result title, full bar
  assert.deepEqual(compactRail(rail([{ title: 'A', status: 'done' }, { title: 'B', status: 'done' }])), { text: 'Result', progress: 1 });
  assert.equal(compactRail(form), null);
  assert.equal(compactRail(rail([])), null);
});

test('a row item that declares where it wraps stacks on a phone: zone columns, the item overview panel', () => {
  assert.equal(declaresWrapPoint('flex: 1 1 calc(64% - 1rem); min-width: min(20rem, 100%);'), true);
  assert.equal(declaresWrapPoint('flex: 0 0 22rem; max-width: 100%; position: sticky'), true);
  assert.equal(declaresWrapPoint('flex: 1 1 24rem; min-width: min(24rem, 100%)'), true);
  assert.equal(declaresWrapPoint('flex: 1'), false);
  assert.equal(declaresWrapPoint(undefined), false);
});
