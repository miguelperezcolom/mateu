using System.Runtime.CompilerServices;
using Mateu.Dtos;

namespace Mateu.Uidl;

// Progress and notifications as patterns — C# analogues of io.mateu.uidl.data.LongTask /
// ProgressReporter and io.mateu.uidl.LiveNotifications (design/progress-and-notifications.md).
// EXPERIMENTAL (3.0): may change in a minor release.

/// <summary>A long-running operation that reports its PROGRESS to the UI over the SSE endpoint:
/// it streams <c>Progress</c> commands (title, status text, fraction or indeterminate, step count,
/// state) and each renderer shows the task natively — a modal progress for a blocking task, its task
/// center / the IDE's background-task indicator for a background one. Return the result of
/// <see cref="Run(Func{ProgressReporter, CancellationToken, IAsyncEnumerable{object}})"/> from an
/// action method.
/// <code>
/// [Button]
/// public LongTaskRun Import() =&gt; LongTask.Create("Importing…")
///     .Background().Cancellable()
///     .Done("Import finished", "1,204 rows")
///     .ResultAction(MessageAction.Open("Open report", "/imports/42"))
///     .Run((progress, ct) =&gt; Rows(progress, ct));
/// </code>
/// (C# analogue of io.mateu.uidl.data.LongTask.) EXPERIMENTAL.</summary>
public sealed class LongTask
{
    /// <summary>The status text a task starts with until the first step reports (translated by the
    /// app's translator).</summary>
    public const string StartingText = "Starting...";

    private readonly string _title;
    private string? _doneTitle;
    private string? _doneText;
    private bool _progressBar;
    private int _closeAfterSeconds;
    private string _startingText = StartingText;
    private readonly List<UICommandDto> _onDone = [];
    private bool _blocking = true;
    private bool _backgroundable;
    private bool _cancellable;
    private bool _retryable;
    private bool _notifyWhenDone;
    private Action? _onCancel;
    private readonly List<MessageAction> _resultActions = [];

    private LongTask(string title) => _title = title;

    /// <summary>A task titled <paramref name="title"/>.</summary>
    public static LongTask Create(string title) => new(title);

    /// <summary>The title and text the task shows once done (each optional).</summary>
    public LongTask Done(string? doneTitle, string? doneText)
    {
        _doneTitle = doneTitle;
        _doneText = doneText;
        return this;
    }

    /// <summary>Determinate: the fraction starts at 0 and the fraction overloads of Step move it.</summary>
    public LongTask WithProgressBar()
    {
        _progressBar = true;
        return this;
    }

    /// <summary>A finished blocking task's surface closes on its own after <paramref name="seconds"/>.</summary>
    public LongTask CloseAfter(int seconds)
    {
        _closeAfterSeconds = seconds;
        return this;
    }

    /// <summary>Commands run once the task is done (navigate to the results…).</summary>
    public LongTask WithCommand(params UICommandDto[] commands)
    {
        _onDone.AddRange(commands);
        return this;
    }

    /// <summary>The status text until the first step reports (default <see cref="StartingText"/>).</summary>
    public LongTask WithStartingText(string text)
    {
        _startingText = text;
        return this;
    }

    /// <summary>A BACKGROUND task: the user keeps working while it runs.</summary>
    public LongTask Background()
    {
        _blocking = false;
        return this;
    }

    /// <summary>A blocking task the user may move to the background.</summary>
    public LongTask Backgroundable()
    {
        _backgroundable = true;
        return this;
    }

    /// <summary>The user may cancel it: the work's CancellationToken is cancelled, the task ends
    /// cancelled. Closing the stream cancels it too.</summary>
    public LongTask Cancellable()
    {
        _cancellable = true;
        return this;
    }

    /// <summary>Runs <paramref name="hook"/> when the task is cancelled (by the user or because its
    /// stream closed). Implies <see cref="Cancellable"/>.</summary>
    public LongTask OnCancel(Action hook)
    {
        _cancellable = true;
        _onCancel = hook;
        return this;
    }

    /// <summary>A failed run may be repeated: the renderer offers Retry (the same action again).</summary>
    public LongTask Retryable()
    {
        _retryable = true;
        return this;
    }

    /// <summary>What the user can do with the result once done ("Open report").</summary>
    public LongTask ResultAction(MessageAction action)
    {
        _resultActions.Add(action);
        return this;
    }

    /// <summary>Once done, the task also posts an inbox entry (a message with persistence inbox).</summary>
    public LongTask NotifyWhenDone()
    {
        _notifyWhenDone = true;
        return this;
    }

    /// <summary>Runs the task: <paramref name="work"/> gets the reporter and a token cancelled when
    /// the user cancels (or the stream closes), and yields the reporter's steps.</summary>
    public LongTaskRun Run(Func<ProgressReporter, CancellationToken, IAsyncEnumerable<object>> work) =>
        new(this, work);

    /// <summary>Runs the task (work that does not observe cancellation by itself).</summary>
    public LongTaskRun Run(Func<ProgressReporter, IAsyncEnumerable<object>> work) =>
        new(this, (progress, _) => work(progress));

    internal ProgressDto Start(string id) => new(
        id, _title ?? "", _startingText ?? "", _progressBar ? 0.0 : null, null, null, ProgressStates.Running,
        _blocking, _blocking && _backgroundable, _cancellable, _retryable,
        DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), null, null, []);

    internal bool ProgressBar => _progressBar;
    internal Action? CancelHook => _onCancel;

    internal UIIncrementDto End(ProgressDto last)
    {
        var done = last with
        {
            State = ProgressStates.Done,
            Title = _doneTitle ?? last.Title,
            Text = _doneText ?? last.Text,
            Fraction = _progressBar || last.Fraction is not null ? 1.0 : null,
            Done = last.Total ?? last.Done,
            CloseAfterSeconds = _closeAfterSeconds > 0 ? _closeAfterSeconds : null,
            ResultActions = _resultActions.Select(ToDto).ToList(),
        };
        var commands = new List<UICommandDto> { ProgressReporter.Command(done) };
        commands.AddRange(_onDone.Select(c => c with { TargetComponentId = null! }));
        var messages = _notifyWhenDone
            ? new List<MessageDto>
            {
                new("success", "middle", done.Title, done.Text, 5000)
                {
                    Persistence = MessagePersistences.Inbox,
                    Actions = done.ResultActions,
                    Key = "task-" + done.TaskId,
                },
            }
            : [];
        return UIIncrementDto.Of(commands: commands, messages: messages);
    }

    /// <summary>A <see cref="MessageAction"/> on the wire.</summary>
    public static MessageActionDto ToDto(MessageAction action) =>
        new(action.Label, action.ActionId, action.Parameters, action.Route, action.Style);
}

/// <summary>A started <see cref="LongTask"/>: what an action returns. Enumerating it yields the
/// task's start, the work's items and its end; the framework streams them over SSE and makes the
/// task cancellable (<c>_progress-cancel</c>). EXPERIMENTAL.</summary>
public sealed class LongTaskRun : IAsyncEnumerable<object>
{
    private readonly LongTask _task;
    private readonly Func<ProgressReporter, CancellationToken, IAsyncEnumerable<object>> _work;

    internal LongTaskRun(LongTask task, Func<ProgressReporter, CancellationToken, IAsyncEnumerable<object>> work)
    {
        _task = task;
        _work = work;
    }

    public async IAsyncEnumerator<object> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        var reporter = new ProgressReporter(_task.Start(Guid.NewGuid().ToString()), _task.ProgressBar);
        yield return ProgressReporter.Increment(reporter.Current);
        var completed = false;
        var items = _work(reporter, cancellationToken).GetAsyncEnumerator(cancellationToken);
        try
        {
            while (await items.MoveNextAsync())
                yield return items.Current;
            completed = true;
        }
        finally
        {
            if (!completed && cancellationToken.IsCancellationRequested) _task.CancelHook?.Invoke();
            try { await items.DisposeAsync(); }
            catch (Exception) { /* a work that cannot be disposed mid-step has nothing to release */ }
        }
        yield return _task.End(reporter.Current);
    }
}

/// <summary>Reports the progress of the task run by <see cref="LongTask"/>. Each Step returns the
/// update to yield — the whole current state of the task, so each renderer shows it its own way.
/// (C# analogue of io.mateu.uidl.data.ProgressReporter.) EXPERIMENTAL.</summary>
public sealed class ProgressReporter
{
    private readonly object _lock = new();
    private readonly bool _progressBar;
    private ProgressDto _current;

    internal ProgressReporter(ProgressDto initial, bool progressBar)
    {
        _current = initial;
        _progressBar = progressBar;
    }

    /// <summary>The task's current state.</summary>
    public ProgressDto Current
    {
        get { lock (_lock) return _current; }
    }

    private UIIncrementDto Update(Func<ProgressDto, ProgressDto> change)
    {
        ProgressDto next;
        lock (_lock) next = _current = change(_current);
        return Increment(next);
    }

    /// <summary>Updates the status text.</summary>
    public object Step(string text) => Update(p => p with { Text = text });

    /// <summary>Updates the status text and the title.</summary>
    public object Step(string text, string title) => Update(p => p with { Text = text, Title = title });

    /// <summary>Updates the status text and the fraction (ignored without WithProgressBar).</summary>
    public object Step(string text, double fraction) =>
        Update(p => _progressBar ? p with { Text = text, Fraction = Clamp(fraction) } : p with { Text = text });

    /// <summary>Updates the status text, the title and the fraction (ignored without WithProgressBar).</summary>
    public object Step(string text, string title, double fraction) =>
        Update(p => _progressBar
            ? p with { Text = text, Title = title, Fraction = Clamp(fraction) }
            : p with { Text = text, Title = title });

    /// <summary>Updates the status text with a count of the work ("12 of 300"): the task becomes
    /// determinate (done / total); a total of 0 or less leaves it as it was.</summary>
    public object Step(string text, int done, int total) =>
        Update(p => total > 0
            ? p with { Text = text, Done = done, Total = total, Fraction = Clamp(done / (double)total) }
            : p with { Text = text });

    private static double Clamp(double value) => double.IsNaN(value) ? 0 : Math.Clamp(value, 0, 1);

    internal static UICommandDto Command(ProgressDto progress) => new(null!, "Progress", progress);

    internal static UIIncrementDto Increment(ProgressDto progress) =>
        UIIncrementDto.Of(commands: [Command(progress)]);
}

/// <summary>Pushes inbox changes to the open sessions of a user (or of everyone) — the realtime
/// half of the notification inbox. Delivered as <c>NotificationsChanged</c> on the live-updates
/// stream of [App(LiveUpdates = true)], only to sessions whose caller is <c>principal</c> (the
/// authenticated name). Store the entry first (the supplier stays the source of truth), then publish.
/// In-process: in a cluster, publish on every node. (C# analogue of io.mateu.uidl.LiveNotifications.)
/// EXPERIMENTAL.</summary>
public static class LiveNotifications
{
    /// <summary>One change: an entry added or changed, one removed, or neither ("fetch the list
    /// again"). Principal null = every session.</summary>
    public sealed record Change(string? Principal, AppNotification? Notification, string? RemovedId);

    private static readonly List<Action<Change>> Listeners = [];
    private static readonly object Lock = new();

    /// <summary>An entry added or changed in <paramref name="principal"/>'s inbox.</summary>
    public static void Publish(string principal, AppNotification notification)
    {
        if (string.IsNullOrWhiteSpace(principal))
            throw new ArgumentException("a notification needs the principal it is for (PublishToAll reaches everyone)",
                nameof(principal));
        Deliver(new Change(principal, notification, null));
    }

    /// <summary>An entry added or changed in every user's inbox.</summary>
    public static void PublishToAll(AppNotification notification) => Deliver(new Change(null, notification, null));

    /// <summary>An entry gone from <paramref name="principal"/>'s inbox.</summary>
    public static void Remove(string? principal, string id) => Deliver(new Change(principal, null, id));

    /// <summary><paramref name="principal"/>'s sessions fetch the list again.</summary>
    public static void Refresh(string? principal) => Deliver(new Change(principal, null, null));

    /// <summary>Listens to every change until the returned handle is disposed (the framework's
    /// event stream, which filters by caller).</summary>
    public static IDisposable Subscribe(Action<Change> listener)
    {
        lock (Lock) Listeners.Add(listener);
        return new Unsubscriber(listener);
    }

    private static void Deliver(Change change)
    {
        Action<Change>[] listeners;
        lock (Lock) listeners = Listeners.ToArray();
        foreach (var listener in listeners)
        {
            try { listener(change); }
            catch { /* one broken stream must not stop the others */ }
        }
    }

    private sealed class Unsubscriber(Action<Change> listener) : IDisposable
    {
        public void Dispose()
        {
            lock (Lock) Listeners.Remove(listener);
        }
    }
}
