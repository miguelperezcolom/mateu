using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Threading.Channels;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>The tasks of this process — what lets a user CANCEL one (<c>_progress-cancel</c>),
/// what lets a reloaded client pick them up again (<c>_progress-tasks</c>, <c>_progress-resume</c>)
/// and what makes every task end with a terminal <c>Progress</c>, whatever stopped it. (Mirrors
/// Java's io.mateu.core.application.progress.ProgressTasks.)
/// <para><see cref="Track"/> wraps a <see cref="LongTaskRun"/>'s stream: a <c>Progress</c> in state
/// running registers its task (owner = the caller, hashed) and gets its ETA stamped
/// (<see cref="EtaEstimator"/>); a terminal one finishes it — the terminal state and the messages of
/// its increment are kept for the grace period, so a client that reloads just then still learns how
/// it ended. When the stream ends with tasks still running they are closed — cancelled after a
/// cancel, else failed with the error message the stream carried. <see cref="Cancel"/>,
/// <see cref="Snapshot"/> and <see cref="Resume"/> reach a task of THE SAME caller only; anything
/// else answers nothing. Bounded, in-process. EXPERIMENTAL.</para></summary>
internal static class ProgressTasks
{
    public const string CancelAction = "_progress-cancel";
    public const string TasksAction = "_progress-tasks";
    public const string ResumeAction = "_progress-resume";
    internal const int MaxTasks = 10_000;
    internal const int MaxSnapshotIds = 50;
    internal const int DefaultGraceSeconds = 60;
    internal const string GraceEnvironmentVariable = "MATEU_PROGRESS_REATTACH_GRACE_SECONDS";

    /// <summary>How long a task runs on with nobody listening (then it is cancelled), and how long
    /// a finished task's end is kept for a client that reattaches. The host sets it from
    /// <c>MateuOptions.ProgressReattachGraceSeconds</c>; else the environment, else 60 s. Zero =
    /// closing the stream cancels the task at once.</summary>
    public static TimeSpan Grace { get; set; } = GraceFromEnvironment();

    internal static TimeSpan GraceFromEnvironment() =>
        int.TryParse(Environment.GetEnvironmentVariable(GraceEnvironmentVariable), out var seconds) && seconds >= 0
            ? TimeSpan.FromSeconds(seconds)
            : TimeSpan.FromSeconds(DefaultGraceSeconds);

    /// <summary>The clock the ETA is estimated on (ms).</summary>
    internal static Func<long> Now { get; set; } = () => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    private sealed class Entry(string owner, CancellationTokenSource stop, long seq, TaskRun? run)
    {
        public string Owner { get; } = owner;
        public CancellationTokenSource Stop { get; } = stop;
        public long Seq { get; } = seq;
        public TaskRun? Run { get; } = run;
        public EtaEstimator Eta { get; } = new();
        public volatile ProgressDto? Last;
        public volatile bool Cancelled;
        public volatile ProgressDto? Terminal;
        public IReadOnlyList<MessageDto> TerminalMessages = [];
    }

    private static readonly ConcurrentDictionary<string, Entry> Tasks = new();
    private static long _seq;

    /// <summary>Whether <paramref name="taskId"/> is running in this process.</summary>
    public static bool IsRunning(string taskId) => Tasks.TryGetValue(taskId, out var e) && e.Terminal is null;

    /// <summary>Whether <paramref name="taskId"/> is known (running, or finished within the grace).</summary>
    internal static bool IsKnown(string taskId) => Tasks.ContainsKey(taskId);

    /// <summary>The caller, hashed: name and every grant of the identity.</summary>
    public static string OwnerOf(string? principal, Identity? identity)
    {
        static string Sorted(IReadOnlyList<string>? values) => string.Join(",", (values ?? []).Order(StringComparer.Ordinal));
        var caller = string.Join("\u0001", principal ?? "null", Sorted(identity?.Roles), Sorted(identity?.Groups),
            Sorted(identity?.Scopes), Sorted(identity?.Permissions));
        return Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(caller)));
    }

    private static Entry? Own(string? taskId, string owner) =>
        taskId is not null && Tasks.TryGetValue(taskId, out var entry) && entry.Owner == owner ? entry : null;

    /// <summary>Cancels the caller's task: its work's token is cancelled and its stream ends
    /// cancelled; answers that cancelled state — or nothing for an unknown/finished/foreign task.</summary>
    public static UIIncrementDto Cancel(string? taskId, string owner)
    {
        if (Own(taskId, owner) is not { Last: not null, Terminal: null } entry) return UIIncrementDto.Of();
        entry.Cancelled = true;
        try { entry.Stop.Cancel(); }
        catch (ObjectDisposedException) { /* the stream just ended */ }
        return UIIncrementDto.Of(commands: [Command(Terminal(entry.Last!, ProgressStates.Cancelled, null))]);
    }

    /// <summary><c>_progress-tasks</c>: one <c>Progress</c> per listed id that is the caller's task,
    /// running (its current state) or finished within the grace period (its terminal state). Unknown,
    /// expired and foreign ids are absent; at most <see cref="MaxSnapshotIds"/> ids are looked at.</summary>
    public static UIIncrementDto Snapshot(IEnumerable<string> taskIds, string owner) =>
        UIIncrementDto.Of(commands: taskIds.Take(MaxSnapshotIds).Distinct()
            .Select(id => Own(id, owner) is { } e ? e.Terminal ?? e.Last : null)
            .Where(p => p is not null)
            .Select(p => Command(p!))
            .ToList());

    /// <summary><c>_progress-resume</c>: the caller's task as a stream — its current state first, then
    /// its later increments reduced to their page-level parts (Progress and NotificationsChanged
    /// commands, messages), ending after its terminal Progress. A finished task: its terminal state
    /// and the messages that came with it. Unknown / foreign: nothing. Subscribing stops a pending
    /// grace cancel.</summary>
    public static async IAsyncEnumerable<UIIncrementDto> Resume(string? taskId, string owner,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (Own(taskId, owner) is not { } entry) yield break;
        if (entry.Terminal is { } done)
        {
            yield return UIIncrementDto.Of(commands: [Command(done)], messages: entry.TerminalMessages.ToList());
            yield break;
        }
        var channel = entry.Run?.Subscribe();
        if (channel is null)
        {
            // no live run to follow (it just ended, or it was drained in process): what is known
            var known = entry.Terminal ?? entry.Last;
            if (known is not null)
                yield return UIIncrementDto.Of(commands: [Command(known)],
                    messages: entry.Terminal is null ? [] : entry.TerminalMessages.ToList());
            yield break;
        }
        try
        {
            if (entry.Last is { } current) yield return UIIncrementDto.Of(commands: [Command(current)]);
            var ended = false;
            await foreach (var increment in channel.Reader.ReadAllAsync(cancellationToken))
            {
                if (PageLevel(increment) is not { } reduced) continue;
                yield return reduced;
                if (reduced.Commands.Any(c => c.Data is ProgressDto p && p.TaskId == taskId && p.State != ProgressStates.Running))
                {
                    ended = true;
                    break;
                }
            }
            // the run ended before the subscription saw the task's end: say it from the registry
            if (!ended && entry.Terminal is { } late)
                yield return UIIncrementDto.Of(commands: [Command(late)], messages: entry.TerminalMessages.ToList());
        }
        finally
        {
            entry.Run!.Unsubscribe(channel);
        }
    }

    /// <summary>The parts of an increment that belong to the page, not to the screen that started
    /// the task; null when nothing is left.</summary>
    private static UIIncrementDto? PageLevel(UIIncrementDto increment)
    {
        var commands = increment.Commands.Where(c => c.Type is "Progress" or "NotificationsChanged").ToList();
        if (commands.Count == 0 && increment.Messages.Count == 0) return null;
        return UIIncrementDto.Of(commands: commands, messages: increment.Messages.ToList());
    }

    /// <summary>The stream of <paramref name="run"/>: each item mapped to its increment, its tasks
    /// registered while they run and always closed. <paramref name="hot"/> = the run that multicasts
    /// it (reattach, grace); <paramref name="post"/> transforms every increment before it leaves.</summary>
    public static async IAsyncEnumerable<UIIncrementDto> Track(
        IAsyncEnumerable<object> run, Func<object, UIIncrementDto> map, Func<Exception, UIIncrementDto> error,
        string owner, Func<string, string>? translate = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default,
        TaskRun? hot = null, TimeSpan? retain = null, Func<UIIncrementDto, UIIncrementDto>? post = null)
    {
        var keep = retain ?? Grace;
        using var stop = new CancellationTokenSource();
        if (hot is not null) hot.Abandon = () =>
        {
            try { stop.Cancel(); }
            catch (ObjectDisposedException) { /* the stream just ended */ }
        };
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, stop.Token);
        var open = new Dictionary<string, Entry>();
        string? lastError = null;
        var userCancelled = false;
        var items = run.GetAsyncEnumerator(linked.Token);
        Task<bool>? pending = null;
        UIIncrementDto? closing = null;
        try
        {
            while (true)
            {
                object item;
                UIIncrementDto? failure = null;
                try
                {
                    pending = items.MoveNextAsync().AsTask();
                    var more = await pending.WaitAsync(linked.Token);
                    pending = null;
                    if (!more) break;
                    item = items.Current;
                }
                catch (OperationCanceledException) when (linked.IsCancellationRequested)
                {
                    userCancelled = stop.IsCancellationRequested && !cancellationToken.IsCancellationRequested;
                    break;
                }
                catch (Exception e)
                {
                    failure = error(MateuErrors.Unwrap(e));
                    item = failure;
                }
                var increment = Observe(item is UIIncrementDto ready ? ready : map(item), owner, stop, open,
                    translate, hot, keep);
                foreach (var message in increment.Messages)
                    if (message.Variant == "error") lastError = message.Text;
                if (hot is not null) hot.OpenTasks = open.Count;
                yield return post is null ? increment : post(increment);
                if (failure is not null) break;
                if (stop.IsCancellationRequested)
                {
                    userCancelled = !cancellationToken.IsCancellationRequested;
                    break;
                }
            }
        }
        finally
        {
            if (hot is not null) hot.Abandon = null;
            // the work is released before its end is announced, so OnCancel has run by then
            // a step still running when the task was cancelled: its token is cancelled, give it a
            // moment to stop (so its OnCancel hook has run) before releasing the work
            var stopped = pending is null;
            if (pending is not null)
            {
                try { await pending.WaitAsync(TimeSpan.FromSeconds(2)); stopped = true; }
                catch (Exception) { stopped = pending.IsCompleted; }
            }
            if (stopped) await DisposeQuietly(items);
            else _ = pending!.ContinueWith(_ => DisposeQuietly(items), TaskScheduler.Default);
            if (open.Count > 0 && !cancellationToken.IsCancellationRequested)
            {
                // the tasks the stream leaves unfinished end here: cancelled after a cancel (or a
                // grace that ran out), else failed — kept for the grace, like any finished task
                var cancelled = userCancelled || open.Values.Any(e => e.Cancelled);
                var ends = open.Values.Where(e => e.Last is not null)
                    .Select(e => (Entry: e, End: cancelled
                        ? Terminal(e.Last!, ProgressStates.Cancelled, null)
                        : Terminal(e.Last!, ProgressStates.Failed, lastError)))
                    .ToList();
                foreach (var (taskId, entry) in open)
                    if (ends.FirstOrDefault(x => x.Entry == entry) is { End: { } end }) Finish(taskId, entry, end, [], keep);
                    else Tasks.TryRemove(taskId, out _);
                closing = UIIncrementDto.Of(commands: ends.Select(x => Command(x.End)).ToList());
            }
            else
            {
                // the client went away from a stream nobody multicasts: as before, nothing to keep
                foreach (var id in open.Keys) Tasks.TryRemove(id, out _);
            }
            if (hot is not null) hot.OpenTasks = 0;
        }
        if (closing is not null) yield return post is null ? closing : post(closing);
    }

    private static async Task DisposeQuietly(IAsyncEnumerator<object> items)
    {
        try { await items.DisposeAsync(); }
        catch (Exception) { /* a step still pending cannot be disposed: its token was cancelled */ }
    }

    private static UIIncrementDto Observe(UIIncrementDto increment, string owner, CancellationTokenSource stop,
        Dictionary<string, Entry> open, Func<string, string>? translate, TaskRun? hot, TimeSpan keep)
    {
        var changed = false;
        var commands = new List<UICommandDto>(increment.Commands.Count);
        foreach (var command in increment.Commands)
        {
            var next = command;
            if (command.Type == "Progress" && command.Data is ProgressDto p)
            {
                var progress = p;
                if (p.State == ProgressStates.Running && p.Text == LongTask.StartingText && translate is not null
                    && translate(p.Text) is { } text && text != p.Text)
                    progress = p with { Text = text };
                if (progress.State == ProgressStates.Running)
                {
                    if (!open.TryGetValue(progress.TaskId, out var entry))
                    {
                        entry = new Entry(owner, stop, Interlocked.Increment(ref _seq), hot);
                        open[progress.TaskId] = entry;
                        Tasks[progress.TaskId] = entry;
                        Evict();
                    }
                    // the ETA, on the work's own clock (null until it is honest)
                    var eta = entry.Eta.Observe(Now(),
                        EtaEstimator.ValueOf(progress.Fraction, progress.Done, progress.Total));
                    if (eta != progress.EtaSeconds) progress = progress with { EtaSeconds = eta };
                    entry.Last = progress;
                }
                else if (open.Remove(progress.TaskId, out var entry))
                    Finish(progress.TaskId, entry, progress, increment.Messages, keep);
                else
                    Tasks.TryRemove(progress.TaskId, out _);
                if (!ReferenceEquals(progress, p))
                {
                    next = command with { Data = progress };
                    changed = true;
                }
            }
            commands.Add(next);
        }
        return changed ? increment with { Commands = commands } : increment;
    }

    /// <summary>A task reached its end: kept (its end and the messages that came with it) for the
    /// grace period, for a client that reattaches; then forgotten.</summary>
    private static void Finish(string taskId, Entry entry, ProgressDto end, IReadOnlyList<MessageDto> messages,
        TimeSpan keep)
    {
        entry.TerminalMessages = messages.ToList();
        entry.Terminal = end;
        if (keep <= TimeSpan.Zero)
        {
            Tasks.TryRemove(new KeyValuePair<string, Entry>(taskId, entry));
            return;
        }
        _ = Task.Delay(keep).ContinueWith(_ => Tasks.TryRemove(new KeyValuePair<string, Entry>(taskId, entry)),
            TaskScheduler.Default);
    }

    private static void Evict()
    {
        if (Tasks.Count <= MaxTasks) return;
        foreach (var oldest in Tasks.OrderBy(t => t.Value.Seq).Take(Tasks.Count - MaxTasks).ToList())
            Tasks.TryRemove(oldest.Key, out _);
    }

    private static ProgressDto Terminal(ProgressDto last, string state, string? error) => last with
    {
        State = state,
        Error = error,
        Backgroundable = false,
        Cancellable = false,
        Retryable = state == ProgressStates.Failed && last.Retryable,
        EtaSeconds = null,
    };

    private static UICommandDto Command(ProgressDto progress) => new(null!, "Progress", progress);
}

/// <summary>A task-bearing stream made HOT: the work runs once (on its own, not on the request that
/// started it) and its increments reach every subscriber — the stream that started it and any
/// <c>_progress-resume</c>. When the last subscriber goes away while a task runs, the task runs on
/// for the grace period and is then cancelled; a stream that reports no task is disposed at once,
/// as before. EXPERIMENTAL.</summary>
internal sealed class TaskRun(TimeSpan grace)
{
    private readonly object _lock = new();
    private readonly List<Channel<UIIncrementDto>> _subscribers = [];
    private readonly CancellationTokenSource _pump = new();
    private Timer? _graceTimer;
    private bool _completed;
    private bool _started;

    /// <summary>How many tasks of the stream are running now (set by the tracker).</summary>
    internal volatile int OpenTasks;

    /// <summary>Stops the stream's running tasks (they end cancelled) — set by the tracker.</summary>
    internal volatile Action? Abandon;

    /// <summary>The stream for the request that started it: subscribes, then starts the work.</summary>
    public async IAsyncEnumerable<UIIncrementDto> Primary(
        Func<CancellationToken, IAsyncEnumerable<UIIncrementDto>> source,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var channel = Subscribe()!;
        Start(source);
        try
        {
            await foreach (var increment in channel.Reader.ReadAllAsync(cancellationToken))
                yield return increment;
        }
        finally
        {
            Unsubscribe(channel);
        }
    }

    private void Start(Func<CancellationToken, IAsyncEnumerable<UIIncrementDto>> source)
    {
        lock (_lock)
        {
            if (_started) return;
            _started = true;
        }
        _ = Task.Run(async () =>
        {
            try
            {
                await foreach (var increment in source(_pump.Token))
                    Broadcast(increment);
            }
            catch (Exception)
            {
                // the work was disposed (nobody listening, no task) or broke after its error increment
            }
            finally
            {
                Complete();
            }
        });
    }

    /// <summary>A new subscriber, or null when the stream has ended. Stops a pending grace cancel.</summary>
    public Channel<UIIncrementDto>? Subscribe()
    {
        lock (_lock)
        {
            if (_completed) return null;
            var channel = Channel.CreateUnbounded<UIIncrementDto>();
            _subscribers.Add(channel);
            _graceTimer?.Dispose();
            _graceTimer = null;
            return channel;
        }
    }

    public void Unsubscribe(Channel<UIIncrementDto> channel)
    {
        Action? now = null;
        lock (_lock)
        {
            if (!_subscribers.Remove(channel) || _subscribers.Count > 0 || _completed) return;
            if (OpenTasks == 0) now = () => _pump.Cancel();
            else if (grace <= TimeSpan.Zero) now = () => Abandon?.Invoke();
            else
            {
                _graceTimer?.Dispose();
                _graceTimer = new Timer(_ => Expire(), null, grace, Timeout.InfiniteTimeSpan);
            }
        }
        try { now?.Invoke(); }
        catch (ObjectDisposedException) { /* it just ended */ }
    }

    private void Expire()
    {
        lock (_lock)
        {
            if (_subscribers.Count > 0 || _completed) return;
        }
        Abandon?.Invoke();
    }

    private void Broadcast(UIIncrementDto increment)
    {
        lock (_lock)
            foreach (var subscriber in _subscribers)
                subscriber.Writer.TryWrite(increment);
    }

    private void Complete()
    {
        lock (_lock)
        {
            _completed = true;
            foreach (var subscriber in _subscribers) subscriber.Writer.TryComplete();
            _graceTimer?.Dispose();
            _graceTimer = null;
        }
    }
}
