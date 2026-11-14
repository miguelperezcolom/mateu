import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';
import { ALL_AGENT_OPERATING_TEXTS, agentOperatingTexts } from './agentOperatingTexts.ts';
import { AgentPushState } from './agentPush.ts';

test('every chrome language has the notice texts, and they are its own', () => {
  assert.deepEqual(Object.keys(ALL_AGENT_OPERATING_TEXTS).sort(), [...CHROME_LANGUAGES].sort());
  for (const lang of CHROME_LANGUAGES) {
    const t = ALL_AGENT_OPERATING_TEXTS[lang];
    assert.ok(t.operating.trim() && t.stop.trim() && t.stopped.trim(), lang);
    if (lang !== 'en') {
      assert.notEqual(t.operating, ALL_AGENT_OPERATING_TEXTS.en.operating, lang);
      assert.notEqual(t.stop, ALL_AGENT_OPERATING_TEXTS.en.stop, lang);
    }
  }
  assert.equal(agentOperatingTexts('en-US').operating, 'An AI agent is operating this screen');
  assert.equal(agentOperatingTexts('es-ES').operating, 'Un agente de IA está manejando esta pantalla');
  assert.equal(agentOperatingTexts('it').stop, 'Interrompi');
  assert.equal(agentOperatingTexts('ja').stop, 'Stop');
});

test('Stop keeps the channel closed until the user connects an agent again', () => {
  const state = new AgentPushState(() => ({ sessionId: 'ui-1', secret: 's' }));
  state.setStatus({ paired: true, agents: ['alice'] });
  let changes = 0;
  state.subscribe(() => changes++);
  state.stopByUser();
  assert.equal(state.stoppedByUser, true);
  assert.equal(state.status.paired, false);
  assert.equal(state.connected, false);
  assert.ok(changes > 0);
  state.resume();
  assert.equal(state.stoppedByUser, false);
});
