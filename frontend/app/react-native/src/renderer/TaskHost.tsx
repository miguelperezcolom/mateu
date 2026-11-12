import React, { useEffect, useState } from 'react';
import { AppState, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, ProgressBar, Surface, Text as PaperText } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { theme, themed } from '../theme';
import { MateuButton } from '../ui/controls';
import { TouchableOpacity } from '../ui/Touchable';
import { buttonA11y, headingA11y, modalA11y } from '../a11y/a11y';
import { elapsedText, etaText, progressA11yValue, stepCountText, stripLabel, type Task, type TaskAction } from '../core/taskCenter';
import { uiLocale } from '../core/money';
import { localNotifier, wireOsNotifications, type NotificationPermission } from '../core/osNotifications';
import type { MateuSession } from '../core/MateuSession';
import { hubHandlesPushTaps, sameUi } from '../core/remotePush';
import { onPushOpened } from '../ui/localNotifications';

const inFront = () => AppState.currentState === 'active' || AppState.currentState == null;

/**
 * The session's background life: its OS notifications (posted while the app is not in front, opened
 * on tap in THIS UI) and the reattach of its tasks when the app comes back to the foreground (a
 * stream the OS cut while the phone slept: the server kept the task running, core/taskReattach.ts).
 */
export function useTaskLifecycle(session: MateuSession): void {
  useEffect(() => wireOsNotifications(session, inFront), [session]);
  useEffect(() => localNotifier().onOpened(({ route, scope }) => {
    if (scope !== session.api.baseUrl) return;
    if (route) session.openView({ label: '', route, consumedRoute: '', serverSideType: '' });
  }), [session]);
  // a tapped REMOTE push of this UI, when no hub opens it (a fixed app: the session is the app)
  useEffect(() => onPushOpened(({ ui, route }) => {
    if (hubHandlesPushTaps() || !sameUi(ui, session.api.baseUrl)) return;
    if (route) session.openView({ label: '', route, consumedRoute: '', serverSideType: '' });
  }), [session]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void session.reattach.foreground(session.reattachHost());
    });
    return () => sub.remove();
  }, [session]);
}

/** "Notify me on this device": shown while the app opted in and the OS has not been asked yet. */
export function NotifyOnThisDevice({ session }: { session: MateuSession }) {
  const [permission, setPermission] = useState<NotificationPermission>('unavailable');
  useEffect(() => {
    let alive = true;
    if (session.osNotifications) void localNotifier().permission().then((p) => alive && setPermission(p));
    return () => { alive = false; };
  }, [session, session.osNotifications]);
  if (!session.osNotifications || permission !== 'undetermined') return null;
  return (
    <MateuButton label="Notify me on this device" buttonStyle="tertiary" icon="bell-outline"
      accessibilityLabel="Notify me on this device when something finishes or arrives"
      // asked ONLY here, from the user's tap
      onPress={() => void localNotifier().request().then((answer) => {
        setPermission(answer);
        // a server that sends pushes learns this phone's token at once (core/remotePush.ts)
        if (answer === 'granted') session.pushSync?.();
      })} />
  );
}

/**
 * The session's TASK CENTER on a phone (design/progress-and-notifications.md): a blocking task the
 * user waits for is a modal (Paper ProgressBar, title, text, "12 of 300", elapsed, Cancel /
 * Background); every other task lives in a strip at the bottom that collapses to "3 tasks running"
 * and opens a sheet listing them (state, progress, cancel, the result and its actions, Retry for a
 * failed task that can be re-run). Tasks outlive the screen that started them — the store belongs to
 * the session.
 */
export function TaskHost({ visible = true }: { visible?: boolean }) {
  const { session } = useAppContext();
  const tasks = session.tasks;
  useTaskLifecycle(session);
  const [, setRevision] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => tasks.subscribe(() => setRevision((r) => r + 1)), [tasks]);

  const list = tasks.list();
  const running = list.some((t) => t.state === 'running');
  // the elapsed time moves once a second while something runs
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const modal = tasks.blocking();
  // a finished blocking task closes on its own after closeAfterSeconds
  useEffect(() => {
    if (!modal || modal.state === 'running' || !modal.closeAfterSeconds) return;
    const timer = setTimeout(() => tasks.moveToBackground(modal.taskId), modal.closeAfterSeconds * 1000);
    return () => clearTimeout(timer);
  }, [modal?.taskId, modal?.state, modal?.closeAfterSeconds, tasks]);

  if (!visible || list.length === 0) return null;
  const strip = list.filter((t) => t !== modal);
  const counts = tasks.counts();

  return (
    <>
      {modal && (
        <Modal {...modalA11y(modal.title || 'Task')} accessibilityViewIsModal transparent animationType="fade" statusBarTranslucent
          onRequestClose={() => (modal.state !== 'running' || modal.backgroundable) && tasks.moveToBackground(modal.taskId)}>
          <View style={styles.backdrop}>
            <Surface elevation={3} style={styles.dialog}>
              <PaperText variant="headlineSmall" {...headingA11y(2)} numberOfLines={2}>{modal.title}</PaperText>
              <TaskBody task={modal} now={now} />
              <View style={styles.dialogActions}>
                {modal.state === 'running' && modal.backgroundable && (
                  <MateuButton label="Background" buttonStyle="tertiary" onPress={() => tasks.moveToBackground(modal.taskId)} />
                )}
                {modal.state !== 'running' && (
                  <MateuButton label="Close" buttonStyle="tertiary" onPress={() => tasks.moveToBackground(modal.taskId)} />
                )}
                <TaskButtons task={modal} onDone={() => tasks.moveToBackground(modal.taskId)} />
              </View>
            </Surface>
          </View>
        </Modal>
      )}
      {strip.length > 0 && (
        <View style={styles.stripHost} pointerEvents="box-none">
          <Surface elevation={2} style={styles.strip}>
            {strip.length === 1 && !sheetOpen ? (
              <TaskRow task={strip[0]} now={now} compact onExpand={() => setSheetOpen(true)} />
            ) : (
              <TouchableOpacity {...buttonA11y({ label: stripLabel(counts), expanded: sheetOpen })} style={styles.stripSummary} onPress={() => setSheetOpen(!sheetOpen)}>
                {counts.running > 0 ? <ActivityIndicator size={16} /> : <IconButton icon="check" size={16} style={styles.noMargin} />}
                <PaperText style={styles.stripText}>{stripLabel(counts)}</PaperText>
                <IconButton icon={sheetOpen ? 'chevron-down' : 'chevron-up'} size={18} style={styles.noMargin} />
              </TouchableOpacity>
            )}
          </Surface>
        </View>
      )}
      {sheetOpen && (
        <Modal {...modalA11y('Tasks')} accessibilityViewIsModal transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
          <View style={styles.sheetBackdrop}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <PaperText variant="titleLarge" {...headingA11y(2)} style={styles.flex}>Tasks</PaperText>
                <NotifyOnThisDevice session={session} />
                {counts.finished > 0 && <MateuButton label="Clear finished" buttonStyle="tertiary" onPress={() => tasks.clearFinished()} />}
                <IconButton icon="close" accessibilityLabel="Close tasks" onPress={() => setSheetOpen(false)} />
              </View>
              <ScrollView contentContainerStyle={styles.sheetList}>
                {[...list].reverse().map((t) => (
                  <TaskRow key={t.taskId} task={t} now={now} onDismiss={() => tasks.dismiss(t.taskId)} />
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

/** Title-less body: text, bar (indeterminate when the server has no fraction), count, elapsed, result. */
function TaskBody({ task, now }: { task: Task; now: number }) {
  const count = stepCountText(task);
  const since = task.startedAt ?? task.seenAt;
  const elapsed = elapsedText(since, task.finishedAt ?? now);
  // the server's estimate, only while it runs and only when it has an honest one
  const eta = task.state === 'running' ? etaText(task.etaSeconds, uiLocale()) : '';
  return (
    <View style={styles.body}>
      {!!task.text && <PaperText style={styles.text}>{task.text}</PaperText>}
      {task.state === 'running' ? (
        <View accessible accessibilityRole="progressbar" accessibilityLabel={task.title || 'Task'} accessibilityValue={progressA11yValue(task)}>
          <ProgressBar indeterminate={task.fraction == null} progress={task.fraction ?? 0} color={theme.primary} />
        </View>
      ) : (
        <PaperText style={[styles.outcome, task.state === 'failed' && styles.failed]}>
          {task.state === 'done' ? 'Finished' : task.state === 'failed' ? `Failed${task.error ? `: ${task.error}` : ''}` : 'Cancelled'}
        </PaperText>
      )}
      <PaperText style={styles.meta}>{[count, elapsed, eta].filter(Boolean).join(' · ')}</PaperText>
    </View>
  );
}

/** Cancel (running, cancellable), Retry (failed, retryable), the result actions (done). */
function TaskButtons({ task, onDone }: { task: Task; onDone?: () => void }) {
  const run = (action: TaskAction) => {
    task.origin.runAction?.(action);
    onDone?.();
  };
  return (
    <>
      {task.state === 'running' && task.cancellable && task.origin.cancel && (
        <MateuButton label="Cancel" accessibilityLabel={`Cancel ${task.title}`} onPress={() => task.origin.cancel!()} />
      )}
      {task.state === 'failed' && task.retryable && task.origin.retry && (
        <MateuButton label="Retry" buttonStyle="primary" onPress={() => { task.origin.retry!(); onDone?.(); }} />
      )}
      {task.state === 'done' &&
        task.resultActions
          .filter((a) => a.label && (a.route || a.actionId))
          .map((a, i) => <MateuButton key={i} label={a.label!} buttonStyle={i === 0 ? 'primary' : null} color={a.style === 'danger' ? 'error' : null} onPress={() => run(a)} />)}
    </>
  );
}

function TaskRow({ task, now, compact, onExpand, onDismiss }: { task: Task; now: number; compact?: boolean; onExpand?: () => void; onDismiss?: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <TouchableOpacity {...buttonA11y({ label: task.title || 'Task', hint: onExpand ? 'Shows every task' : undefined })} style={styles.flex} disabled={!onExpand} onPress={onExpand}>
          <PaperText variant="titleSmall" numberOfLines={1}>{task.title}</PaperText>
        </TouchableOpacity>
        {onDismiss && task.state !== 'running' && <IconButton icon="close" size={18} style={styles.noMargin} accessibilityLabel={`Remove ${task.title}`} onPress={onDismiss} />}
      </View>
      <TaskBody task={task} now={now} />
      {!compact || task.state !== 'running' || task.cancellable ? (
        <View style={styles.rowActions}><TaskButtons task={task} /></View>
      ) : null}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  dialog: { borderRadius: 28, padding: 24, gap: 16, backgroundColor: theme.surface },
  dialogActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
  body: { gap: 8 },
  text: { color: theme.ink },
  meta: { color: theme.muted, fontSize: 12 },
  outcome: { color: theme.success, fontWeight: '600' },
  failed: { color: theme.danger },
  stripHost: { position: 'absolute', left: 8, right: 8, bottom: 8 },
  strip: { borderRadius: 12, backgroundColor: theme.surface, paddingHorizontal: 12, paddingVertical: 4 },
  stripSummary: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: theme.minTouch },
  stripText: { flex: 1, color: theme.ink },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '80%', backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingLeft: 24, paddingRight: 8, paddingTop: 12 },
  sheetList: { paddingHorizontal: 16, gap: 12 },
  row: { gap: 6, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  rowTop: { flexDirection: 'row', alignItems: 'center', minHeight: theme.minTouch },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
  flex: { flex: 1 },
  noMargin: { margin: 0 },
}));
