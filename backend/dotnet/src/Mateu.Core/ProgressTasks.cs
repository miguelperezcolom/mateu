using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>The running tasks of this process — what lets a user CANCEL one (<c>_progress-cancel</c>)
/// and what makes every task end with a terminal <c>Progress</c>, whatever stopped it. (Mirrors
/// Java's io.mateu.core.application.progress.ProgressTasks.)
/// <para><see cref="Track"/> wraps a <see cref="LongTaskRun"/>'s stream: a <c>Progress</c> in state
/// running registers its task (owner = the caller, hashed), a terminal one unregisters it; when the
/// stream ends with tasks still running they are closed — cancelled after a cancel, else failed
/// with the error message the stream carried. <see cref="Cancel"/> stops a task of THE SAME caller
/// only; anything else answers an empty increment. Bounded, in-process. EXPERIMENTAL.</para></summary>
internal static class ProgressTasks
{
    public const string CancelAction = "_progress-cancel";
    internal const int MaxTasks = 10_000;

    private sealed class Entry(string owner, CancellationTokenSource stop, long seq)
    {
        public string Owner { get; } = owner;
        public CancellationTokenSource Stop { get; } = stop;
        public long Seq { get; } = seq;
        public volatile ProgressDto? Last;
        public volatile bool Cancelled;
    }

    private static readonly ConcurrentDictionary<string, Entry> Tasks = new();
    private static long _seq;

    /// <summary>Whether <paramref name="taskId"/> is running in this process.</summary>
    public static bool IsRunning(string taskId) => Tasks.ContainsKey(taskId);

    /// <summary>The caller, hashed: name and every grant of the identity.</summary>
    public static string OwnerOf(string? principal, Identity? identity)
    {
        static string Sorted(IReadOnlyList<string>? values) => string.Join(",", (values ?? []).Order(StringComparer.Ordinal));
        var caller = string.Join("\u0001", principal ?? "null", Sorted(identity?.Roles), Sorted(identity?.Groups),
            Sorted(identity?.Scopes), Sorted(identity?.Permissions));
        return Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(caller)));
    }

    /// <summary>Cancels the caller's task: its work's token is cancelled and its stream ends
    /// cancelled; answers that cancelled state — or nothing for an unknown/foreign task.</summary>
    public static UIIncrementDto Cancel(string? taskId, string owner)
    {
        if (taskId is null || !Tasks.TryGetValue(taskId, out var entry) || entry.Owner != owner || entry.Last is null)
            return UIIncrementDto.Of();
        entry.Cancelled = true;
        try { entry.Stop.Cancel(); }
        catch (ObjectDisposedException) { /* the stream just ended */ }
        return UIIncrementDto.Of(commands: [Command(Terminal(entry.Last, ProgressStates.Cancelled, null))]);
    }

    /// <summary>The stream of <paramref name="run"/>: each item mapped to its increment, its tasks
    /// registered while they run and always closed.</summary>
    public static async IAsyncEnumerable<UIIncrementDto> Track(
        IAsyncEnumerable<object> run, Func<object, UIIncrementDto> map, Func<Exception, UIIncrementDto> error,
        string owner, Func<string, string>? translate = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        using var stop = new CancellationTokenSource();
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, stop.Token);
        var open = new Dictionary<string, Entry>();
        string? lastError = null;
        var userCancelled = false;
        var items = run.GetAsyncEnumerator(linked.Token);
        Task<bool>? pending = null;
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
                    translate);
                foreach (var message in increment.Messages)
                    if (message.Variant == "error") lastError = message.Text;
                yield return increment;
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
            foreach (var id in open.Keys) Tasks.TryRemove(id, out _);
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
        }
        if (open.Count > 0 && !cancellationToken.IsCancellationRequested)
        {
            var cancelled = userCancelled || open.Values.Any(e => e.Cancelled);
            yield return UIIncrementDto.Of(commands: open.Values
                .Where(e => e.Last is not null)
                .Select(e => Command(cancelled
                    ? Terminal(e.Last!, ProgressStates.Cancelled, null)
                    : Terminal(e.Last!, ProgressStates.Failed, lastError)))
                .ToList());
        }
    }

    private static async Task DisposeQuietly(IAsyncEnumerator<object> items)
    {
        try { await items.DisposeAsync(); }
        catch (Exception) { /* a step still pending cannot be disposed: its token was cancelled */ }
    }

    private static UIIncrementDto Observe(UIIncrementDto increment, string owner, CancellationTokenSource stop,
        Dictionary<string, Entry> open, Func<string, string>? translate)
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
                {
                    progress = p with { Text = text };
                    next = command with { Data = progress };
                    changed = true;
                }
                if (progress.State == ProgressStates.Running)
                {
                    if (!open.TryGetValue(progress.TaskId, out var entry))
                    {
                        entry = new Entry(owner, stop, Interlocked.Increment(ref _seq));
                        open[progress.TaskId] = entry;
                        Tasks[progress.TaskId] = entry;
                        Evict();
                    }
                    entry.Last = progress;
                }
                else
                {
                    open.Remove(progress.TaskId);
                    Tasks.TryRemove(progress.TaskId, out _);
                }
            }
            commands.Add(next);
        }
        return changed ? increment with { Commands = commands } : increment;
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
    };

    private static UICommandDto Command(ProgressDto progress) => new(null!, "Progress", progress);
}
