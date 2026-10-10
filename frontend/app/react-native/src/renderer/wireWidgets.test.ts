import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  avatarColor,
  avatarGroupSplit,
  cellText,
  contentSlots,
  destinationIntent,
  elementKind,
  flattenTree,
  gridColumnsOf,
  gridRowsOf,
  initials,
  menuIntent,
  parseFormDefinition,
  responsiveColumns,
  resultLook,
  textOfHtml,
  trackCount,
} from './wireWidgets.ts';
import { bpmnKind, parseBpmn, workflowDiagram } from './diagrams.ts';

test('initials: the abbreviation wins, else the first letters of two words', () => {
  assert.equal(initials('Ada Lovelace'), 'AL');
  assert.equal(initials('Ada Byron Lovelace'), 'AB');
  assert.equal(initials('ada', 'xy'), 'XY');
  assert.equal(initials(''), '?');
});

test('avatar colours are stable per name and honour an explicit index', () => {
  assert.equal(avatarColor('Ada'), avatarColor('Ada'));
  assert.equal(avatarColor('x', 0), avatarColor('y', 0));
});

test('avatar group: shown + overflow', () => {
  assert.deepEqual(avatarGroupSplit([1, 2, 3, 4, 5], 3), { shown: [1, 2, 3], overflow: 2 });
  assert.deepEqual(avatarGroupSplit([1, 2], 0), { shown: [1, 2], overflow: 0 });
});

const grid = {
  id: 'g',
  metadata: {
    type: 'Grid',
    content: [
      { id: 'name', metadata: { type: 'GridColumn', label: 'Name' } },
      { id: 'qty', metadata: { type: 'GridColumn', label: 'Qty', align: 'end', actionId: 'open' } },
    ],
    page: { content: [{ name: 'static' }], totalElements: 1 },
  },
};

test('grid columns come from the GridColumn children', () => {
  assert.deepEqual(gridColumnsOf(grid), [
    { id: 'name', label: 'Name', align: undefined, actionId: undefined },
    { id: 'qty', label: 'Qty', align: 'end', actionId: 'open' },
  ]);
});

test('grid rows: data page > state override > metadata page', () => {
  assert.deepEqual(gridRowsOf(grid, {}, {}), [{ name: 'static' }]);
  assert.deepEqual(gridRowsOf(grid, { g: [{ name: 'state' }] }, {}), [{ name: 'state' }]);
  assert.deepEqual(gridRowsOf(grid, { g: [{ name: 'state' }] }, { g: { page: { content: [{ name: 'data' }] } } }), [{ name: 'data' }]);
});

test('tree rows flatten depth-first with their depth', () => {
  const flat = flattenTree([{ n: 'a', children: [{ n: 'a1' }, { n: 'a2', children: [{ n: 'a21' }] }] }, { n: 'b' }]);
  assert.deepEqual(
    flat.map((f) => `${f.row['n']}:${f.depth}`),
    ['a:0', 'a1:1', 'a2:1', 'a21:2', 'b:0'],
  );
});

test('cell text for objects, booleans and nulls', () => {
  assert.equal(cellText({ s: { label: 'L' } }, 's'), 'L');
  assert.equal(cellText({ b: true }, 'b'), '✓');
  assert.equal(cellText({}, 'x'), '');
  assert.equal(cellText({ n: 3 }, 'n'), '3');
});

test('responsive grid tracks and the phone stacking rule', () => {
  assert.equal(trackCount('repeat(3, 1fr)'), 3);
  assert.equal(trackCount('2fr 1fr'), 2);
  assert.equal(trackCount('minmax(10rem, 1fr) 20rem'), 2);
  assert.equal(trackCount('repeat(auto-fit, minmax(16rem, 1fr))'), 0);
  assert.equal(responsiveColumns('repeat(3, 1fr)', 390), 1);
  assert.equal(responsiveColumns('repeat(3, 1fr)', 1024), 3);
  assert.equal(responsiveColumns('repeat(auto-fit, minmax(16rem, 1fr))', 900), 3);
  assert.equal(responsiveColumns('1fr 1fr', 700, '800px'), 1);
});

test('content layout slots', () => {
  const s = contentSlots([{ slot: 'main-0' }, { slot: 'aside-0' }, { slot: 'footer-0' }, {}]);
  assert.equal(s.main.length, 2);
  assert.equal(s.aside.length, 1);
  assert.equal(s.footer.length, 1);
});

test('result looks and destination intents', () => {
  assert.equal(resultLook('Success').tone, 'success');
  assert.equal(resultLook('Error').glyph, '✕');
  assert.equal(resultLook(undefined).tone, 'info');
  assert.deepEqual(destinationIntent({ type: 'Url', value: 'https://x.io' }), { kind: 'url', target: 'https://x.io' });
  assert.deepEqual(destinationIntent({ type: 'Url', value: '/orders' }), { kind: 'route', target: '/orders' });
  assert.deepEqual(destinationIntent({ type: 'ActionId', value: 'retry' }), { kind: 'action', target: 'retry' });
  assert.deepEqual(destinationIntent({ type: 'View', id: '/home' }), { kind: 'route', target: '/home' });
  assert.deepEqual(destinationIntent(null), { kind: 'none', target: '' });
});

test('menu intents', () => {
  assert.equal(menuIntent({ actionId: 'go' }).kind, 'action');
  assert.equal(menuIntent({ route: '/x' }).kind, 'route');
  assert.equal(menuIntent({ path: '/y' }).target, '/y');
  assert.equal(menuIntent({ submenus: [{ label: 'a' }] }).kind, 'submenu');
  assert.equal(menuIntent({ actionId: 'go', disabled: true }).kind, 'none');
  assert.equal(menuIntent({ separator: true }).kind, 'none');
});

test('form definition preview', () => {
  const d = parseFormDefinition('{"name":"Signup","fields":[{"id":"email","label":"Email","dataType":"string","stereotype":"email","required":true},{"id":"age","dataType":"integer","stereotype":"regular"}]}');
  assert.equal(d.name, 'Signup');
  assert.deepEqual(d.fields[0], { id: 'email', label: 'Email', dataType: 'string', stereotype: 'email', required: true, description: undefined });
  assert.equal(d.fields[1]!.label, 'age');
  assert.equal(d.fields[1]!.stereotype, undefined);
  assert.deepEqual(parseFormDefinition('nope'), { name: '', fields: [] });
});

test('element kinds and html text', () => {
  assert.equal(elementKind('h2'), 'heading');
  assert.equal(elementKind('img'), 'image');
  assert.equal(elementKind('my-widget'), 'custom');
  assert.equal(elementKind('section'), 'block');
  assert.equal(textOfHtml('<p>Hello <b>you</b></p><p>bye</p>'), 'Hello you\nbye');
});

// ── diagrams ────────────────────────────────────────────────────────────────

const BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI">
  <bpmn:process id="p1">
    <bpmn:startEvent id="start" name="Order received" />
    <bpmn:userTask id="approve" name="Approve &amp; sign" />
    <bpmn:exclusiveGateway id="gw" />
    <bpmn:endEvent id="end" />
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="approve" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="d1"><bpmndi:BPMNPlane id="pl" bpmnElement="p1">
    <bpmndi:BPMNShape id="s1" bpmnElement="start"><dc:Bounds x="100" y="100" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s2" bpmnElement="approve"><dc:Bounds x="200" y="78" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s3" bpmnElement="gw" isMarkerVisible="true"><dc:Bounds x="350" y="93" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s4" bpmnElement="end"><dc:Bounds x="450" y="100" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="e1" bpmnElement="f1"><di:waypoint x="136" y="118" /><di:waypoint x="200" y="118" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;

test('BPMN: shapes, kinds, labels and edges from the diagram interchange', () => {
  const d = parseBpmn(BPMN);
  assert.deepEqual(
    d.nodes.map((n) => `${n.id}:${n.kind}`),
    ['start:start', 'approve:task', 'gw:gateway', 'end:end'],
  );
  assert.equal(d.nodes[1]!.label, 'Approve & sign');
  // normalised to a 20px margin
  assert.equal(d.nodes[0]!.x, 20);
  assert.equal(d.edges.length, 1);
  assert.equal(d.edges[0]!.points[0]!.x, 56);
  assert.equal(d.width, 450 - 100 + 36 + 40);
});

test('BPMN without layout falls back to a row; garbage yields an empty scene', () => {
  const d = parseBpmn('<definitions><process><startEvent id="a"/><task id="b" name="Do"/><endEvent id="c"/></process></definitions>');
  assert.equal(d.nodes.length, 3);
  assert.ok(d.nodes[1]!.x > d.nodes[0]!.x);
  assert.equal(parseBpmn('').nodes.length, 0);
  assert.equal(parseBpmn(undefined).nodes.length, 0);
  assert.equal(bpmnKind('intermediateCatchEvent'), 'event');
  assert.equal(bpmnKind('sequenceFlow'), 'other');
});

test('workflow: layered by precondition, edges parent → child', () => {
  const { name, diagram } = workflowDiagram(
    JSON.stringify({
      name: 'Onboarding',
      steps: [
        { id: 'a', type: 'ACTION', name: 'Create account' },
        { id: 'b', type: 'USER_TASK', name: 'Verify', preconditionStepId: 'a' },
        { id: 'c', type: 'ACTION', name: 'Welcome mail', preconditionStepId: 'a' },
        { id: 'd', type: 'END', preconditionStepId: 'b' },
      ],
    }),
  );
  assert.equal(name, 'Onboarding');
  const y = Object.fromEntries(diagram.nodes.map((n) => [n.id, n.y]));
  assert.ok(y['a']! < y['b']!);
  assert.equal(y['b'], y['c']);
  assert.ok(y['d']! > y['b']!);
  assert.equal(diagram.edges.length, 3);
  assert.equal(workflowDiagram('{bad').diagram.nodes.length, 0);
});

test('workflow: a precondition cycle does not hang', () => {
  const { diagram } = workflowDiagram(JSON.stringify({ steps: [{ id: 'a', preconditionStepId: 'b' }, { id: 'b', preconditionStepId: 'a' }] }));
  assert.equal(diagram.nodes.length, 2);
});
