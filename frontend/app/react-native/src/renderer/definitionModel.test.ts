import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addField, addStep, deleteField, deleteStep, duplicateField, moveField, newDefinitionId, parseFormEditorValue,
  parseWorkflow, serializeDefinition, stepCaption, stereotypePatch, typeSpecificProperty, updateField, updateForm,
  updateStep, updateWorkflow, wholeNumber,
} from './definitionModel.ts';

const seq = (...values: number[]) => { let i = 0; return () => values[i++ % values.length]!; };

test('workflow: absent or broken value → the web default; unknown keys survive', () => {
  assert.deepEqual(parseWorkflow(undefined), { name: 'New Workflow', steps: [] });
  assert.deepEqual(parseWorkflow('not json'), { name: 'New Workflow', steps: [] });
  assert.deepEqual(parseWorkflow('[1]'), { name: 'New Workflow', steps: [] });
  const wf = parseWorkflow('{"name":"Orders","owner":"ops","steps":[{"id":"a","type":"FORK","name":"Split","x":1}]}');
  assert.equal(wf['owner'], 'ops');
  assert.equal(wf.steps[0]!['x'], 1);
  assert.equal(wf.steps[0]!.type, 'FORK');
});

test('workflow: add, edit and delete steps like the web element', () => {
  let wf = parseWorkflow('{"name":"Orders","steps":[]}');
  const added = addStep(wf, seq(0.123456789));
  wf = added.wf;
  assert.match(added.id, /^step-[0-9a-z]+$/);
  assert.deepEqual(wf.steps[0], { id: added.id, type: 'ACTION', name: 'New Step' });
  const second = addStep(wf, seq(0.987654321));
  wf = updateStep(second.wf, second.id, { name: 'Ship', preconditionStepId: added.id, compensationStepId: added.id, topic: 'orders.ship' });
  assert.equal(stepCaption(wf, wf.steps[1]!), 'ACTION · after New Step');
  // emptied optionals disappear
  wf = updateStep(wf, second.id, { topic: undefined });
  assert.equal('topic' in wf.steps[1]!, false);
  // deleting a step clears every pointer at it
  wf = deleteStep(wf, added.id);
  assert.deepEqual(wf.steps, [{ id: second.id, type: 'ACTION', name: 'Ship' }]);
});

test('workflow settings: patch and drop emptied keys', () => {
  const wf = updateWorkflow(parseWorkflow(undefined), { status: 'ACTIVE', limitConcurrentExecutions: true, maxConcurrentExecutions: 3 });
  assert.deepEqual(wf, { name: 'New Workflow', steps: [], status: 'ACTIVE', limitConcurrentExecutions: true, maxConcurrentExecutions: 3 });
  assert.equal('description' in updateWorkflow(wf, { description: undefined }), false);
});

test('type-specific properties, numbers and the serialization', () => {
  assert.deepEqual(typeSpecificProperty('ACTION'), { key: 'topic', label: 'Topic' });
  assert.equal(typeSpecificProperty('USER_TASK')?.key, 'formId');
  assert.equal(typeSpecificProperty('PROCESS')?.key, 'childWorkflowDefinitionId');
  assert.equal(typeSpecificProperty('END'), undefined);
  assert.equal(wholeNumber('12'), 12);
  assert.equal(wholeNumber(''), 0);
  assert.equal(wholeNumber('-3'), 0);
  assert.equal(wholeNumber('abc'), 0);
  assert.equal(serializeDefinition({ name: 'x', steps: [] }), '{\n  "name": "x",\n  "steps": []\n}');
});

test('ids are fresh: a taken one is drawn again, a degenerate source still ends unique', () => {
  const first = newDefinitionId('step', [], seq(0.123456789));
  assert.equal(newDefinitionId('step', [first], seq(0.123456789, 0.5)), 'step-i');
  assert.equal(newDefinitionId('field', [], () => 0), 'field-1');
});

test('form editor: add, duplicate, move, edit and delete fields like the web element', () => {
  let form = parseFormEditorValue(undefined);
  assert.deepEqual(form, { name: 'New Form', fields: [] });
  const a = addField(form, seq(0.111111));
  const b = addField(a.form, seq(0.222222));
  form = updateField(b.form, a.id, { label: 'Email', required: true });
  const copy = duplicateField(form, a.id, seq(0.333333));
  form = copy.form;
  assert.deepEqual(form.fields.map((f) => f.label), ['Email', 'Email (copy)', 'New Field']);
  assert.equal(form.fields[1]!.id, copy.id);
  assert.equal(form.fields[1]!.required, true);
  form = moveField(form, b.id, -1);
  assert.deepEqual(form.fields.map((f) => f.id), [a.id, b.id, copy.id]);
  assert.equal(moveField(form, a.id, -1), form);
  assert.equal(moveField(form, copy.id, 1), form);
  form = updateField(form, a.id, stereotypePatch('email'));
  assert.equal(form.fields[0]!.stereotype, 'email');
  form = updateField(form, a.id, stereotypePatch(''));
  assert.equal('stereotype' in form.fields[0]!, false);
  form = deleteField(form, b.id);
  assert.deepEqual(form.fields.map((f) => f.id), [a.id, copy.id]);
  assert.deepEqual(duplicateField(form, 'nope').form, form);
  assert.deepEqual(updateForm(form, { name: 'Signup', description: undefined }).name, 'Signup');
});
