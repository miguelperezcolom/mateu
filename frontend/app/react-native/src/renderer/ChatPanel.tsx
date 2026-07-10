import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MateuSession } from '../core/MateuSession';

interface Message {
  from: 'user' | 'agent';
  text: string;
}

/**
 * AI chat (App.sseUrl): POSTs {message, sessionId} to the SSE endpoint and renders the
 * accumulated `data:` payloads as the agent's reply. Native fetch has no incremental streaming,
 * so the reply appears when complete — same wire contract as the web's mateu-chat.
 */
export function ChatPanel({ session, sseUrl, onClose }: { session: MateuSession; sseUrl: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const chatSessionId = useRef(`chat-${Math.random().toString(36).slice(2)}`);
  const scroll = useRef<ScrollView>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text }]);
    setBusy(true);
    try {
      const response = await fetch(sseUrl, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, sessionId: chatSessionId.current }),
      });
      const raw = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${raw.slice(0, 200)}`);
      const reply = raw
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .filter((payload) => payload && !payload.startsWith('{')) // skip token-usage/custom-event JSON frames
        .join('');
      setMessages((m) => [...m, { from: 'agent', text: reply || '…' }]);
    } catch (e) {
      setMessages((m) => [...m, { from: 'agent', text: `⚠️ ${e instanceof Error ? e.message : String(e)}` }]);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <Modal animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Assistant</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView ref={scroll} style={styles.messages} contentContainerStyle={{ padding: 12, gap: 8 }}>
            {messages.length === 0 && <Text style={styles.hint}>Ask anything about this app.</Text>}
            {messages.map((m, i) => (
              <View key={i} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.agentBubble]}>
                <Text style={m.from === 'user' ? styles.userText : styles.agentText}>{m.text}</Text>
              </View>
            ))}
            {busy && <ActivityIndicator color="#0070f3" />}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message…"
              onSubmitEditing={() => void send()}
              editable={!busy}
            />
            <TouchableOpacity style={styles.send} onPress={() => void send()} disabled={busy}>
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '75%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  close: { fontSize: 18, color: '#666', paddingHorizontal: 8 },
  messages: { flex: 1 },
  hint: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 24 },
  bubble: { maxWidth: '85%', borderRadius: 12, padding: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0070f3' },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: '#f1f3f4' },
  userText: { color: '#fff', fontSize: 14 },
  agentText: { color: '#1a1a1a', fontSize: 14 },
  inputRow: { flexDirection: 'row', padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0070f3', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 16 },
});
