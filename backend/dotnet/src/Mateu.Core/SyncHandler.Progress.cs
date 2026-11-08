using System.Runtime.CompilerServices;
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

    /// <summary>The streamed rest of the request handled in <paramref name="slot"/>.</summary>
    public IAsyncEnumerable<UIIncrementDto> ContinueStream(
        StreamSlot slot, Func<Exception, UIIncrementDto> error, CancellationToken cancellationToken) =>
        slot.Run is null
            ? Empty()
            : ProgressTasks.Track(slot.Run, item => MapResult(item, slot.Request), error, Owner(),
                text => _i18n.Translate(text), cancellationToken);

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
