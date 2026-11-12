import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  KeyShortcutRegistry, actionShortcutsOf, isTypingElement, modifiersMatch, shortcutMatches, worksWhileTyping,
} from './keyShortcuts.ts';

test('matching: modifiers exactly, key by logical key or physical code (the web rule)', () => {
  assert.equal(shortcutMatches('ctrl+s', { key: 's', ctrlKey: true }), true);
  assert.equal(shortcutMatches('ctrl+s', { key: 's', ctrlKey: true, shiftKey: true }), false);
  assert.equal(shortcutMatches('ctrl+s', { key: 's' }), false);
  // Spanish layout: Ctrl+Alt+E types € — the physical code still says KeyE
  assert.equal(shortcutMatches('ctrl+alt+e', { key: '€', code: 'KeyE', ctrlKey: true, altKey: true }), true);
  assert.equal(shortcutMatches('alt+1', { key: '¡', code: 'Digit1', altKey: true }), true);
  assert.equal(shortcutMatches('alt+1', { key: 'End', code: 'Numpad1', altKey: true }), true);
  assert.equal(shortcutMatches('F9', { key: 'F9', code: 'F9' }), true);
  assert.equal(shortcutMatches('enter', { key: 'Enter' }), true);
  assert.equal(shortcutMatches('', { key: 'a' }), false);
  assert.equal(shortcutMatches(undefined, { key: 'a' }), false);
  assert.equal(modifiersMatch('meta+k', { key: 'k', metaKey: true }), true);
});

test('while typing only combinations and function keys apply', () => {
  assert.equal(worksWhileTyping('ctrl+s'), true);
  assert.equal(worksWhileTyping('alt+1'), true);
  assert.equal(worksWhileTyping('f9'), true);
  assert.equal(worksWhileTyping('f13'), false);
  assert.equal(worksWhileTyping('a'), false);
  assert.equal(worksWhileTyping('shift+a'), false);
});

test('registry: the screen wins over the app, the latest screen entry first; unregister removes', () => {
  const registry = new KeyShortcutRegistry();
  const ran: string[] = [];
  const offApp = registry.register({ shortcut: 'f9', scope: 'app', run: () => ran.push('app f9') });
  const offOld = registry.register({ shortcut: 'f9', scope: 'screen', run: () => ran.push('old screen') });
  const offNew = registry.register(
    { shortcut: 'f9', scope: 'screen', run: () => ran.push('new screen') },
    { shortcut: 'x', scope: 'screen', run: () => ran.push('x') },
    { shortcut: '  ', scope: 'screen', run: () => ran.push('blank') },
  );
  assert.equal(registry.size(), 4);
  assert.equal(registry.handle({ key: 'F9' }, false), true);
  offNew();
  assert.equal(registry.handle({ key: 'F9' }, false), true);
  offOld();
  assert.equal(registry.handle({ key: 'F9' }, false), true);
  offApp();
  assert.equal(registry.handle({ key: 'F9' }, false), false);
  assert.deepEqual(ran, ['new screen', 'old screen', 'app f9']);
  assert.equal(registry.size(), 0);
});

test('registry: a bare key does not fire while typing, a combination does', () => {
  const registry = new KeyShortcutRegistry();
  let n = 0;
  registry.register({ shortcut: 'n', scope: 'screen', run: () => n++ }, { shortcut: 'ctrl+n', scope: 'screen', run: () => (n += 10) });
  assert.equal(registry.handle({ key: 'n' }, true), false);
  assert.equal(registry.handle({ key: 'n', ctrlKey: true }, true), true);
  assert.equal(registry.handle({ key: 'n' }, false), true);
  assert.equal(n, 11);
});

test('action shortcuts are read off the component actions; typing targets are inputs', () => {
  assert.deepEqual(actionShortcutsOf([
    { id: 'save', shortcut: 'ctrl+s' }, { id: 'cancel' }, { id: 'x', shortcut: ' ' }, null, { shortcut: 'f2' },
  ]), [{ actionId: 'save', shortcut: 'ctrl+s' }]);
  assert.deepEqual(actionShortcutsOf(undefined), []);
  assert.equal(isTypingElement({ tagName: 'INPUT', type: 'text' }), true);
  assert.equal(isTypingElement({ tagName: 'INPUT', type: 'checkbox' }), false);
  assert.equal(isTypingElement({ tagName: 'TEXTAREA' }), true);
  assert.equal(isTypingElement({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(isTypingElement({ tagName: 'DIV' }), false);
  assert.equal(isTypingElement(null), false);
});
