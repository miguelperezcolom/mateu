import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, tableCells } from './markdownBlocks.ts';

test('a single newline is a soft break: one paragraph, lines joined by a space', () => {
  assert.deepEqual(parseMarkdown('Check-in from 14:00,\ncheck-out until 11:00.\n\nSecond.'), [
    { kind: 'paragraph', text: 'Check-in from 14:00, check-out until 11:00.' },
    { kind: 'paragraph', text: 'Second.' },
  ]);
});

test('two trailing spaces or a backslash keep a hard break', () => {
  assert.deepEqual(parseMarkdown('one  \ntwo\\\nthree'), [{ kind: 'paragraph', text: 'one\ntwo\nthree' }]);
});

test('a fenced block is code, verbatim: indentation, javadoc stars and # comments are not markdown', () => {
  const src = '`path/File.java`\n\n```java\n/**\n * A doc.\n */\nclass A {\n    # not a heading\n  - not a bullet\n}\n```\nafter';
  assert.deepEqual(parseMarkdown(src), [
    { kind: 'paragraph', text: '`path/File.java`' },
    { kind: 'code', lang: 'java', text: '/**\n * A doc.\n */\nclass A {\n    # not a heading\n  - not a bullet\n}' },
    { kind: 'paragraph', text: 'after' },
  ]);
});

test('an unclosed fence runs to the end', () => {
  assert.deepEqual(parseMarkdown('```yaml\na: 1'), [{ kind: 'code', lang: 'yaml', text: 'a: 1' }]);
});

test('a heading directly followed by text, then a table', () => {
  const src = '### House rules\nCheck-in from **14:00**.\nQuiet *23:00*.\n\n| Service | Hours |\n|---|--:|\n| Reception | 24 h |\n| Restaurant | 13:00 – 23:00 |\n';
  assert.deepEqual(parseMarkdown(src), [
    { kind: 'heading', level: 3, text: 'House rules' },
    { kind: 'paragraph', text: 'Check-in from **14:00**. Quiet *23:00*.' },
    { kind: 'table', header: ['Service', 'Hours'], align: ['left', 'right'], rows: [['Reception', '24 h'], ['Restaurant', '13:00 – 23:00']] },
  ]);
});

test('nested lists carry their depth, continuation lines join their item, ordered items count', () => {
  const src = '- one\n  continued\n  - nested\n    - deeper\n- two\n\n1. first\n2. second';
  assert.deepEqual(parseMarkdown(src), [
    { kind: 'list', items: [
      { depth: 0, marker: '•', text: 'one continued' },
      { depth: 1, marker: '•', text: 'nested' },
      { depth: 2, marker: '•', text: 'deeper' },
      { depth: 0, marker: '•', text: 'two' },
      { depth: 0, marker: '1.', text: 'first' },
      { depth: 0, marker: '2.', text: 'second' },
    ] },
  ]);
});

test('a blockquote holds blocks; a rule is a rule', () => {
  assert.deepEqual(parseMarkdown('> quoted\n> still\n\n---\n\ntext'), [
    { kind: 'quote', blocks: [{ kind: 'paragraph', text: 'quoted still' }] },
    { kind: 'rule' },
    { kind: 'paragraph', text: 'text' },
  ]);
});

test('table cells: outer pipes optional, escaped pipes literal', () => {
  assert.deepEqual(tableCells('| a | b \\| c |'), ['a', 'b | c']);
  assert.deepEqual(tableCells('a|b'), ['a', 'b']);
});
