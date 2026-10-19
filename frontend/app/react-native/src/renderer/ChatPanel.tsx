import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MateuSession } from '../core/MateuSession';
import { theme } from '../theme';
import { buttonA11y } from '../a11y/a11y';
import { RichText } from './FieldWidgets';
import {
  CHAT_TEXTS,
  ChatTurn,
  applyChatEvent,
  chatLinkNavigation,
  chatRequestBody,
  menuContextOf,
  previewActionOf,
  resolveChatUrl,
  uploadedFiles,
  usageLine,
  type ChatEventHooks,
  type ChatTurnUpdate,
} from '../core/chatStream';

interface Message {
  id: number;
  from: 'user' | 'agent';
  text: string;
}

interface Attachment {
  name: string;
  path: string;
}

/**
 * The chat's session id. The agent backend keys the conversation (and its uploads) by it, so it
 * must not be guessable: a CSPRNG when the runtime has one (web, Hermes with a getRandomValues
 * polyfill), Math.random only as a last resort.
 */
function newChatSessionId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string; getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (c?.randomUUID) return `chat-${c.randomUUID()}`;
  if (c?.getRandomValues) {
    const bytes = c.getRandomValues(new Uint8Array(16));
    return `chat-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return `chat-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * The assistant (App.sseUrl / the Chat component). POSTs the message — with what is on screen, the
 * menu (first message) and the app's MCP endpoint — to the SSE endpoint and reads the answer AS IT
 * STREAMS, by event (core/chatStream.ts): deltas grow the bubble, the progress line says what the
 * agent is doing, the token line shows the turn's usage, and the agent's UI events
 * (navigation-requested, close-requested, render-screen, any other) are applied as they arrive.
 *
 * Stays mounted while hidden (`visible`), so the conversation survives closing and reopening —
 * and a navigation or a rendered screen hides the sheet to show it while the stream goes on.
 */
export function ChatPanel({
  session,
  sseUrl,
  uploadUrl,
  visible = true,
  onClose,
}: {
  session: MateuSession;
  sseUrl: string;
  /** The Chat component's own upload endpoint; else the app's (App.uploadUrl). */
  uploadUrl?: string | null;
  visible?: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [usage, setUsage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const chatSessionId = useRef(newChatSessionId());
  const menuContextSent = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const turnRef = useRef<ChatTurn | null>(null);
  const nextId = useRef(1);
  const newMessage = (from: Message['from'], text: string): Message => ({ id: nextId.current++, from, text });

  const base = session.api.baseUrl;
  const url = resolveChatUrl(sseUrl, base);
  const upload = resolveChatUrl(uploadUrl || session.chatApp.uploadUrl, base);

  // the progress line counts seconds while the agent works
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      const turn = turnRef.current;
      if (turn) setProgress(turn.progress.line(Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [busy]);

  const scrollToEnd = () => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);

  const setAgentText = (id: number, text: string) => {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text } : msg)));
    scrollToEnd();
  };

  const hooks: ChatEventHooks = {
    dispatch: (event, detail) => session.dispatchEvent(event, detail),
    navigate: (nav) => {
      session.navigateTo(nav);
      onClose(); // on a phone the sheet would cover where the user was sent; the chat stays mounted
    },
    close: onClose,
    renderScreen: (req) => {
      const route = session.currentScreen()?.route ?? '';
      session.api
        .runAction({ ...previewActionOf(req, route), appState: session.appState })
        .then((increment) => session.showPreview(increment, req.target, req.title))
        .catch((e) => session.notify(null, errorText(e), 'error'));
      onClose();
    },
  };

  // a link to a screen of the app ([Nora](/booking/bookings/4MBZS7)) opens it in the app, through
  // the menu entry that serves it — like the agent's own navigation-requested
  const openRoute = (route: string) => {
    const nav = chatLinkNavigation(session.chatApp.menu, route);
    if (nav) hooks.navigate(nav);
  };

  const pickFiles = async () => {
    if (!upload || uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
    const assets = result.canceled ? [] : (result.assets ?? []);
    if (assets.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('sessionId', chatSessionId.current);
      assets.forEach((asset, i) => {
        const name = asset.fileName ?? `image-${i + 1}.jpg`;
        // web: the picked File itself; native: the {uri, name, type} part React Native uploads
        const part = asset.file ?? ({ uri: asset.uri, name, type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
        form.append('files', part, name);
      });
      const saved = uploadedFiles(await session.api.postForm(upload, form));
      setAttachments((a) => [...a, ...saved]);
    } catch (e) {
      setMessages((m) => [...m, newMessage('agent', `⚠️ Could not upload the files: ${errorText(e)}`)]);
    } finally {
      setUploading(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    const files = attachments;
    // a message with only attachments is still worth sending
    if ((!text && files.length === 0) || busy || !url) return;
    setInput('');
    setAttachments([]);
    const shown = files.length ? `${text}${text ? '\n\n' : ''}📎 ${files.map((f) => f.name).join(', ')}` : text;
    const userMessage = newMessage('user', shown);
    const agentMessage = newMessage('agent', '');
    const agentIndex = agentMessage.id;
    setMessages((m) => [...m, userMessage, agentMessage]);
    const turn = new ChatTurn(Date.now());
    turnRef.current = turn;
    setBusy(true);
    setProgress(turn.progress.line(Date.now()));
    scrollToEnd();

    const apply = (update: ChatTurnUpdate) => {
      if (update.answer) setAgentText(agentIndex, turn.answer.text);
      if (update.progress) {
        setProgress(turn.progress.line(Date.now()));
        setUsage(usageLine(turn.usage) ?? null);
      }
      // UI events act NOW, mid-stream
      for (const event of update.events) applyChatEvent(event, hooks);
    };

    try {
      const mcpUrl = session.chatApp.mcpUrl ? resolveChatUrl(session.chatApp.mcpUrl, base) : undefined;
      const body = chatRequestBody({
        message: text,
        sessionId: chatSessionId.current,
        attachments: files,
        screen: session.currentScreen(),
        appState: session.appState,
        mcpUrl,
        menuContext: menuContextSent.current ? undefined : menuContextOf(session.chatApp.menu),
      });
      menuContextSent.current = true;
      await session.api.postStream(url, JSON.stringify(body), (chunk) => apply(turn.push(chunk, Date.now())));
      apply(turn.end(Date.now()));
      setAgentText(agentIndex, turn.finalText);
    } catch (e) {
      const soFar = turn.answer.text;
      setAgentText(agentIndex, `${soFar ? soFar + '\n\n' : ''}${CHAT_TEXTS.errorPrefix}${errorText(e)}`);
    } finally {
      setBusy(false);
      setProgress(null);
      turnRef.current = null;
    }
  };

  const canSend = !busy && (!!input.trim() || attachments.length > 0);

  return (
    <Modal visible={visible} accessibilityViewIsModal accessibilityLabel="Assistant" animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Assistant</Text>
            <TouchableOpacity {...buttonA11y({ label: 'Close assistant' })} onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView ref={scroll} style={styles.messages} contentContainerStyle={{ padding: 12, gap: 8 }}>
            {messages.length === 0 && <Text style={styles.hint}>Ask anything about this app.</Text>}
            {messages.map((m) =>
              m.from === 'agent' && !m.text ? null : (
                <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.agentBubble]}>
                  {m.from === 'user' ? <Text style={styles.userText}>{m.text}</Text> : <RichText value={m.text} kind="markdown" onRouteLink={openRoute} />}
                </View>
              ),
            )}
            {busy && (
              <View style={styles.progressRow} accessibilityLiveRegion="polite">
                <ActivityIndicator color={theme.primary} />
                {!!progress && <Text style={styles.progress}>{progress}</Text>}
              </View>
            )}
            {!!usage && <Text style={styles.usage}>{usage}</Text>}
          </ScrollView>
          {attachments.length > 0 && (
            <View style={styles.chips}>
              {attachments.map((a) => (
                <View key={a.path} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>📎 {a.name}</Text>
                  <TouchableOpacity
                    {...buttonA11y({ label: `Remove ${a.name}` })}
                    onPress={() => setAttachments((list) => list.filter((x) => x.path !== a.path))}
                    hitSlop={theme.hitSlop}
                  >
                    <Text style={styles.chipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={styles.inputRow}>
            {!!upload && (
              <TouchableOpacity {...buttonA11y({ label: 'Attach files', disabled: uploading })} style={styles.attach} onPress={() => void pickFiles()} disabled={uploading}>
                <Text style={styles.attachText}>{uploading ? '…' : '📎'}</Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message…"
              accessibilityLabel="Message"
              onSubmitEditing={() => void send()}
              editable={!busy}
            />
            <TouchableOpacity {...buttonA11y({ label: 'Send message', disabled: !canSend })} style={styles.send} onPress={() => void send()} disabled={!canSend}>
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
  sheet: { backgroundColor: theme.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '75%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.divider },
  title: { fontSize: 16, fontWeight: '600', color: theme.ink },
  close: { fontSize: 18, color: theme.muted, paddingHorizontal: 8 },
  messages: { flex: 1 },
  hint: { color: theme.faint, fontStyle: 'italic', textAlign: 'center', marginTop: 24 },
  bubble: { maxWidth: '85%', borderRadius: 12, padding: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.primary },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: theme.divider },
  userText: { color: theme.white, fontSize: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  progress: { color: theme.muted, fontSize: 13, fontStyle: 'italic' },
  usage: { color: theme.faint, fontSize: 11, alignSelf: 'flex-end' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 10, paddingTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%', borderRadius: theme.radiusPill, backgroundColor: theme.divider, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { color: theme.ink, fontSize: 12, flexShrink: 1 },
  chipRemove: { color: theme.muted, fontSize: 12 },
  inputRow: { flexDirection: 'row', padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: theme.divider },
  attach: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  attachText: { fontSize: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: theme.white, fontSize: 16 },
});
