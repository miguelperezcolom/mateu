using System.Runtime.CompilerServices;
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Progress reporting (LongTask) and the notification inbox's push (mirrors Java's ProgressTasks
// wrapping RunActionUseCase, and LiveUpdatesActionRunner's notifications).
internal sealed partial class SyncHandler
{
    /// <summary>Where an action that answered a <see cref="LongTaskRun"/> leaves it: the SSE
    /// endpoint opens a slot before handling, then streams the run (<see cref="ContinueStream"/>);
    /// any other caller gets the whole stream merged into one answer.</summary>
    public sealed class StreamSlot
    {
        internal IAsyncEnumerable<object>? Run { get; set; }
        internal RunActionRqDto? Request { get; set; }

        /// <summary>Whether the handled action answered a stream to continue.</summary>
        public bool HasStream => Run is not null;
    }

    private static readonly AsyncLocal<StreamSlot?> Slot = new();

    /// <summary>Opens a stream slot for the request about to be handled (the SSE endpoint).</summary>
    public static StreamSlot BeginStream()
    {
        var slot = new StreamSlot();
        Slot.Value = slot;
        return slot;
    }

    /// <summary>A <see cref="LongTaskRun"/> answered by an action: parked in the open slot (the SSE
    /// leg streams it), or — no slot — noted so the sync leg runs it to the end.</summary>
    private static UIIncrementDto ParkStream(IAsyncEnumerable<object> run, RunActionRqDto? rq)
    {
        var slot = Slot.Value;
        if (slot is null)
        {
            slot = new StreamSlot();
            Slot.Value = slot;
        }
        slot.Run = run;
        slot.Request = rq;
        return UIIncrementDto.Of();
    }

    /// <summary><paramref name="run"/>, then — once it is over and nothing it yielded was an error
    /// <see cref="Message"/> — the answer of <paramref name="then"/>, built only then (it sees what
    /// the work set). A failing run ends the stream before (ProgressTasks.Track stops on it).</summary>
    private static async IAsyncEnumerable<object> Then(
        IAsyncEnumerable<object> run, Func<UIIncrementDto> then,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var failed = false;
        await foreach (var item in run.WithCancellation(cancellationToken))
        {
            if (item is Message { Variant: MessageVariant.Error }
                || (item is UIIncrementDto increment && increment.Messages.Any(m => m.Variant == "error")))
                failed = true;
            yield return item;
        }
        if (!failed && !cancellationToken.IsCancellationRequested) yield return then();
    }

    /// <summary>The caller of this request, hashed (what owns a task).</summary>
    private string Owner() => ProgressTasks.OwnerOf(Principal?.Invoke(), identity?.Invoke());

    /// <summary>The streamed rest of the request handled in <paramref name="slot"/>. <paramref name="hot"/>
    /// (the SSE endpoint): the work runs on its own and is multicast — a task survives its stream for
    /// the grace period (<see cref="ProgressTasks.Grace"/>, or <paramref name="grace"/>) and a reloaded
    /// client resumes it with <c>_progress-resume</c>; the inbox messages it answers are stored for
    /// the caller. Not hot (the sync leg, in-process callers): the stream as it runs, ending with the
    /// caller's token.</summary>
    public IAsyncEnumerable<UIIncrementDto> ContinueStream(
        StreamSlot slot, Func<Exception, UIIncrementDto> error, CancellationToken cancellationToken,
        bool hot = false, TimeSpan? grace = null)
    {
        if (slot.Run is null) return Empty();
        if (!hot)
            return ProgressTasks.Track(slot.Run, item => MapResult(item, slot.Request), error, Owner(),
                text => _i18n.Translate(text), cancellationToken, retain: grace);
        // read now, on the request: the work may outlive it
        var owner = Owner();
        var principal = Principal?.Invoke();
        var run = new TaskRun(grace ?? ProgressTasks.Grace);
        UIIncrementDto Safe(Exception e)
        {
            // the request may be gone when a task that outlived it fails: never let that fail too
            try { return error(e); }
            catch (Exception) { return MateuErrors.Increment(MateuErrors.Unwrap(e), Guid.NewGuid().ToString("N"), false); }
        }
        return run.Primary(token => ProgressTasks.Track(slot.Run, item => MapResult(item, slot.Request), Safe, owner,
            text => _i18n.Translate(text), token, run, grace, increment => StoreInbox(increment, principal)),
            cancellationToken);
    }

    /// <summary><c>_progress-resume {taskId}</c> (the SSE endpoint): the caller's task as a stream —
    /// nothing for an unknown or foreign one.</summary>
    public IAsyncEnumerable<UIIncrementDto> ResumeTask(RunActionRqDto rq, CancellationToken cancellationToken)
    {
        EstablishRequestContext(rq);
        return ProgressTasks.Resume(StateString(GetState(rq.Parameters, "taskId")), Owner(), cancellationToken);
    }

    /// <summary><c>_progress-tasks {taskIds}</c>: the caller's tasks among the listed ids.</summary>
    private UIIncrementDto TasksSnapshot(RunActionRqDto rq)
    {
        var raw = GetState(rq.Parameters, "taskIds");
        List<string?> ids = raw switch
        {
            null => [],
            JsonElement { ValueKind: JsonValueKind.Array } array => array.EnumerateArray()
                .Select(e => e.ValueKind == JsonValueKind.String ? e.GetString() : e.ToString()).ToList(),
            string one => [one],
            System.Collections.IEnumerable list => list.Cast<object?>().Select(StateString).ToList(),
            _ => [StateString(raw)],
        };
        return ProgressTasks.Snapshot(ids.Where(id => !string.IsNullOrEmpty(id)).Select(id => id!), Owner());
    }

    /// <summary>The INBOX messages of an answer to an authenticated caller, kept in the inbox store
    /// for that principal and pushed to its other sessions: id = the message's key, else a new one
    /// (stamped as the key, so the session entry and the stored one are the same entry). An
    /// anonymous caller's stay session-only.</summary>
    internal UIIncrementDto StoreInbox(UIIncrementDto increment, string? principal)
    {
        if (string.IsNullOrWhiteSpace(principal) || increment.Messages.All(m => m.Persistence != MessagePersistences.Inbox))
            return increment;
        var messages = increment.Messages.Select(m =>
        {
            if (m.Persistence != MessagePersistences.Inbox) return m;
            var id = string.IsNullOrEmpty(m.Key) ? "inbox-" + Guid.NewGuid().ToString("N") : m.Key;
            var blankTitle = string.IsNullOrWhiteSpace(m.Title);
            var entry = new AppNotification(id, blankTitle ? m.Text : m.Title, blankTitle ? null : m.Text, null, true,
                DateTime.Now.ToString("yyyy-MM-dd HH:mm", System.Globalization.CultureInfo.InvariantCulture))
            {
                Variant = Enum.TryParse<MessageVariant>(m.Variant, true, out var variant) ? variant : null,
                // an actionId needs the screen that sent the message: only the routes travel
                Actions = m.Actions.Where(a => !string.IsNullOrEmpty(a.Route))
                    .Select(a => new MessageAction(a.Label, null, null, a.Route, a.Style)).ToList(),
            };
            InboxStore.Add(principal, entry);
            LiveNotifications.Publish(principal, entry);
            // and to the caller's phones, when the app sends pushes (remote push)
            DeliverPush(principal, PushMessage.Of(entry));
            return m with { Key = id };
        }).ToList();
        return increment with { Messages = messages };
    }

    /// <summary>Where the inbox messages are kept: the app's IInboxStore service, else Mateu's
    /// in-memory default.</summary>
    public IInboxStore InboxStore { get; init; } = new InMemoryInboxStore();

    /// <summary>Where record presence is kept: the app's IPresenceStore service, else Mateu's
    /// process-wide in-memory one. EXPERIMENTAL.</summary>
    public IPresenceStore PresenceStore { get; init; } = Presence.DefaultStore;

    /// <summary>Whether presence is on for the app the request names: a class carrying [App] must
    /// say Presence = true; a data-authored shell (no class) decides on the client.</summary>
    public Type? TypeNamed(string? fullName) => registry.TypeByName(fullName);

    public static bool PresenceEnabledFor(Type? appType) =>
        appType?.Find<AppAttribute>() is not { } app || app.Presence;

    /// <summary>The _presence app-level action: records this tab on the record (route + view,
    /// viewing | editing | leave) and answers a PresenceChanged command with the OTHER people.
    /// Nothing for an anonymous caller, an app without [App(Presence)] or a page that is no
    /// record. (Mirrors Java's PresenceActionRunner.)</summary>
    private UIIncrementDto PresenceAction(Type type, RunActionRqDto rq)
    {
        var principal = Principal?.Invoke();
        if (string.IsNullOrWhiteSpace(principal) || !PresenceEnabledFor(type)) return UIIncrementDto.Of();
        var record = Presence.RecordOf(StateString(GetState(rq.Parameters, "route")),
            StateString(GetState(rq.Parameters, "view")));
        if (record is null) return UIIncrementDto.Of();
        var scope = Presence.ScopeOf(RequestBaseUrl.Value, rq.ServerSideType ?? type.FullName);
        var tab = StateString(GetState(rq.Parameters, "tab"));
        var state = StateString(GetState(rq.Parameters, "state"));
        Presence.Sweep(PresenceStore);
        if (state == "leave")
        {
            Presence.Leave(PresenceStore, scope, record, principal, tab);
            return UIIncrementDto.Of();
        }
        Presence.Touch(PresenceStore, scope, record, principal, tab, state == "editing");
        return UIIncrementDto.Of(commands: [Presence.Command(Presence.Snapshot(PresenceStore, scope, record, principal))]);
    }

    private static async IAsyncEnumerable<UIIncrementDto> Empty()
    {
        await Task.CompletedTask;
        yield break;
    }

    /// <summary>The sync leg of a streamed action: the whole stream, merged in order.</summary>
    private UIIncrementDto Drain(StreamSlot slot, UIIncrementDto first)
    {
        var all = new List<UIIncrementDto> { first };
        all.AddRange(ContinueStream(slot,
            e => MateuErrors.Increment(e, Guid.NewGuid().ToString("N"), ErrorBoundary.DetailedByEnvironment()),
            CancellationToken.None).ToBlockingEnumerable());
        return Merge(all);
    }

    /// <summary>Runs <paramref name="handle"/>; a stream an action answered with no SSE slot open is
    /// run to the end and merged (the sync endpoint, in-process callers).</summary>
    private UIIncrementDto WithStreamsDrained(Func<UIIncrementDto> handle)
    {
        var outer = Slot.Value;
        var own = outer is null;
        var slot = outer ?? new StreamSlot();
        Slot.Value = slot;
        try
        {
            var increment = handle();
            if (!own || slot.Run is null) return increment;
            return Drain(slot, increment);
        }
        finally
        {
            if (own) Slot.Value = null;
        }
    }

    /// <summary><c>_progress-cancel {taskId}</c>: the caller cancels its own running task.</summary>
    private UIIncrementDto CancelTask(RunActionRqDto rq) =>
        ProgressTasks.Cancel(StateString(GetState(rq.Parameters, "taskId")), Owner());

    /// <summary>An inbox entry on the wire.</summary>
    internal static AppNotificationDto NotificationDto(AppNotification n) => new(
        n.Id, n.Title, n.Text, n.Route, n.Unread, n.When, n.Category,
        n.Variant?.ToString().ToLowerInvariant(), n.Resolved, n.Actions.Select(LongTask.ToDto).ToList(), n.HasDetail);

    /// <summary>Whether a live inbox change reaches the caller: addressed to everyone, or to the
    /// caller's authenticated name.</summary>
    public static bool IsFor(LiveNotifications.Change change, string? caller) =>
        change.Principal is null || (!string.IsNullOrWhiteSpace(caller) && caller == change.Principal);

    /// <summary>A live inbox change as it travels on the live-updates stream.</summary>
    public static UICommandDto NotificationsChangedCommand(LiveNotifications.Change change) =>
        new(null!, "NotificationsChanged", new NotificationsChangedDto(
            change.Notification is null ? null : NotificationDto(change.Notification), change.RemovedId));
}
