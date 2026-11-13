using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// The server half of the offline send queue (Java's <c>io.mateu.core.infra.idempotency.IdempotencyKeys</c>):
/// a sync request carrying an <c>Idempotency-Key</c> header runs ONCE per caller, action and key;
/// a repeat gets the first answer back, and a repeat arriving while the first run is in flight
/// joins it.
/// <para>Remembered in memory, per process — lost on a restart and never shared between instances
/// (several of them need sticky routing for the guarantee to hold). Two separate tables: runs IN
/// FLIGHT are never evicted (dropping one would let a retry of its key start a second run while the
/// first is still working) — when there are <see cref="MaxEntries"/> of them a NEW key is refused
/// with a <see cref="UserFacingException"/> (<see cref="BusyTitle"/>), an error answer the client
/// keeps queued and sends again later; the answers of FINISHED runs are bounded
/// (<see cref="MaxEntries"/>, least recently used first out) and kept for <see cref="Ttl"/> (24 h).
/// A run that throws or answers an error message (a refusal, the error boundary's) is forgotten,
/// so the key can be sent again. Entries are removed by identity, never by key alone.</para>
/// <para>The caller is the complete effective identity (<see cref="CallerOf"/>) — the one the
/// access checks read — so one user's key never answers for another's request and changed grants
/// never replay an answer remembered for the old ones.</para>
/// </summary>
public static partial class IdempotencyKeys
{
    /// <summary>The request header carrying the key (the IETF httpapi draft's name).</summary>
    public const string Header = "Idempotency-Key";

    /// <summary>Title of the refusal when too many keyed requests are in flight (same in the 3 backends).</summary>
    public const string BusyTitle = "Too many pending requests";

    /// <summary>Text of the refusal when too many keyed requests are in flight.</summary>
    public const string BusyMessage = "The server is still processing too many requests. Try again in a moment.";

    /// <summary>How many runs may be in flight, and how many finished answers are remembered
    /// (env <c>MATEU_IDEMPOTENCY_MAX_ENTRIES</c>).</summary>
    public static int MaxEntries { get; set; } = EnvNumber("MATEU_IDEMPOTENCY_MAX_ENTRIES", 2000);

    /// <summary>How long an answer is remembered (env <c>MATEU_IDEMPOTENCY_TTL_SECONDS</c>).</summary>
    public static TimeSpan Ttl { get; set; } = TimeSpan.FromSeconds(EnvNumber("MATEU_IDEMPOTENCY_TTL_SECONDS", 24 * 60 * 60));

    private sealed class Finished(Task<UIIncrementDto> answer, DateTime createdAt)
    {
        public Task<UIIncrementDto> Answer { get; } = answer;
        public DateTime CreatedAt { get; } = createdAt;
        public DateTime Touched { get; set; } = createdAt;
    }

    private static readonly object Lock = new();
    /// <summary>Runs not finished yet: never evicted, admission bounded.</summary>
    private static readonly Dictionary<string, Task<UIIncrementDto>> InFlight = new();
    /// <summary>Answers of finished runs: LRU + TTL.</summary>
    private static readonly Dictionary<string, Finished> Answers = new();

    [GeneratedRegex("^[A-Za-z0-9_\\-:.]{8,128}$")]
    private static partial Regex Valid();

    /// <summary>The key, or null when the header is missing or does not look like a key.</summary>
    public static string? KeyOf(string? header)
    {
        if (string.IsNullOrWhiteSpace(header)) return null;
        var trimmed = header.Trim();
        return Valid().IsMatch(trimmed) ? trimmed : null;
    }

    /// <summary>The caller an idempotency key is scoped to, canonical and complete: the identity's
    /// name (else <paramref name="principalName"/>, the authenticated principal's), roles, groups,
    /// scopes and permissions, each list sorted — the same grants always give the same text and any
    /// change of grants another.</summary>
    public static string CallerOf(string? principalName, Identity? identity)
    {
        static string Joined(IReadOnlyList<string>? items) =>
            string.Join("\u0003", (items ?? []).Where(i => i is not null).Distinct(StringComparer.Ordinal)
                .Order(StringComparer.Ordinal));
        var name = identity?.Name ?? principalName ?? "";
        return string.Join("\u0001",
            "name=" + name,
            "roles=" + Joined(identity?.Roles),
            "groups=" + Joined(identity?.Groups),
            "scopes=" + Joined(identity?.Scopes),
            "permissions=" + Joined(identity?.Permissions));
    }

    /// <summary>Runs <paramref name="run"/> unless <paramref name="caller"/> already sent
    /// <paramref name="key"/> for <paramref name="actionId"/>; then the first answer is replayed
    /// (joined while it is still in flight). <paramref name="caller"/> is any stable text naming the
    /// caller (<see cref="CallerOf"/>; hashed here). A NEW key while <see cref="MaxEntries"/> runs
    /// are in flight answers a faulted task (<see cref="UserFacingException"/>).</summary>
    public static Task<UIIncrementDto> OnceAsync(
        string? caller, string? actionId, string? key, Func<Task<UIIncrementDto>> run)
    {
        if (KeyOf(key) is not { } valid) return run();
        var scoped = Sha256((caller ?? "") + "\u0002" + (actionId ?? "") + "\u0002" + valid);
        TaskCompletionSource<UIIncrementDto> answer;
        lock (Lock)
        {
            var now = DateTime.UtcNow;
            if (Answers.TryGetValue(scoped, out var known))
            {
                if (now - known.CreatedAt <= Ttl)
                {
                    known.Touched = now;
                    return known.Answer;
                }
                Answers.Remove(scoped);
            }
            if (InFlight.TryGetValue(scoped, out var running)) return running;
            if (InFlight.Count >= Math.Max(1, MaxEntries))
                return Task.FromException<UIIncrementDto>(new UserFacingException(BusyTitle, BusyMessage));
            // registered BEFORE the run starts: a run that fails synchronously must find its entry
            // to forget it, and a repeat arriving meanwhile must find it to join it
            answer = new TaskCompletionSource<UIIncrementDto>(TaskCreationOptions.RunContinuationsAsynchronously);
            InFlight[scoped] = answer.Task;
        }
        _ = RunAndSettle(scoped, run, answer);
        return answer.Task;
    }

    // ── Deduplication AFTER the request checks (the sync endpoint) ─────────────────────────────

    /// <summary>A keyed request going through the handler: not claimed until the handler reaches a
    /// <see cref="Checkpoint"/>, i.e. until the request passed the checks its action would pass.</summary>
    private sealed class Pending(string scoped)
    {
        public string Scoped { get; } = scoped;
        public bool Claimed { get; set; }
        public TaskCompletionSource<UIIncrementDto>? Mine { get; set; }
    }

    /// <summary>Unwinds the handler to <see cref="GuardedAsync"/>, which answers with the remembered
    /// run (never an error: no catch on the way may turn it into an answer of its own).</summary>
    internal sealed class Replay(Task<UIIncrementDto> answer) : Exception("idempotency replay")
    {
        public Task<UIIncrementDto> Answer { get; } = answer;
    }

    private static readonly AsyncLocal<Pending?> Current = new();

    /// <summary>Runs <paramref name="run"/> (the sync handler) with the request's key PENDING: it is
    /// looked up only when the handler calls <see cref="Checkpoint"/>, right after the request passed
    /// the checks its action would pass (class gates, the action's resolution and access attributes,
    /// the crud write gates, an editable view's read-only check, a capability's declared writes, the
    /// YAML access keys). A request refused before that is never answered from memory, whatever rule
    /// refused it; one that passed them and repeats a known key gets the first answer back (joining
    /// it while in flight). A request that never reaches a checkpoint (a load, a search) just runs.</summary>
    public static async Task<UIIncrementDto> GuardedAsync(
        string? caller, string? actionId, string? key, Func<Task<UIIncrementDto>> run)
    {
        if (KeyOf(key) is not { } valid) return await run().ConfigureAwait(false);
        var pending = new Pending(Sha256((caller ?? "") + "\u0002" + (actionId ?? "") + "\u0002" + valid));
        var previous = Current.Value;
        Current.Value = pending;
        try
        {
            UIIncrementDto increment;
            try
            {
                increment = await run().ConfigureAwait(false);
            }
            catch (Exception e) when (Unwrap(e) is Replay replay)
            {
                return await replay.Answer.ConfigureAwait(false);
            }
            catch (Exception e)
            {
                if (pending.Mine is { } failed)
                {
                    Settle(pending.Scoped, failed.Task, remember: false);
                    failed.SetException(e);
                }
                throw;
            }
            if (pending.Mine is { } mine)
            {
                Settle(pending.Scoped, mine.Task, remember: !Refused(increment));
                mine.SetResult(increment);
            }
            return increment;
        }
        finally
        {
            Current.Value = previous;
        }
    }

    /// <summary>The request passed its checks and its action is about to run: claims the pending key.
    /// Returns when the key is new (the action runs, its answer is remembered); unwinds to
    /// <see cref="GuardedAsync"/> with the remembered answer when the key is known; throws the
    /// admission refusal when too many keyed runs are in flight. A no-op without a pending key, or
    /// once claimed.</summary>
    public static void Checkpoint()
    {
        if (Current.Value is not { Claimed: false } pending) return;
        pending.Claimed = true;
        lock (Lock)
        {
            var now = DateTime.UtcNow;
            if (Answers.TryGetValue(pending.Scoped, out var known))
            {
                if (now - known.CreatedAt <= Ttl)
                {
                    known.Touched = now;
                    throw new Replay(known.Answer);
                }
                Answers.Remove(pending.Scoped);
            }
            if (InFlight.TryGetValue(pending.Scoped, out var running)) throw new Replay(running);
            if (InFlight.Count >= Math.Max(1, MaxEntries)) throw new UserFacingException(BusyTitle, BusyMessage);
            var mine = new TaskCompletionSource<UIIncrementDto>(TaskCreationOptions.RunContinuationsAsynchronously);
            InFlight[pending.Scoped] = mine.Task;
            pending.Mine = mine;
        }
    }

    private static Exception Unwrap(Exception e)
    {
        while (e is System.Reflection.TargetInvocationException or AggregateException && e.InnerException is not null)
            e = e.InnerException!;
        return e;
    }

    private static async Task RunAndSettle(
        string scoped, Func<Task<UIIncrementDto>> run, TaskCompletionSource<UIIncrementDto> answer)
    {
        try
        {
            var increment = await run().ConfigureAwait(false);
            Settle(scoped, answer.Task, remember: !Refused(increment));
            answer.SetResult(increment);
        }
        catch (Exception e)
        {
            Settle(scoped, answer.Task, remember: false);
            answer.SetException(e);
        }
    }

    /// <summary>Whether an answer refused the request: nothing to remember.</summary>
    public static bool Refused(UIIncrementDto? increment) =>
        increment?.Messages?.Any(m => m is not null && m.Variant == "error") == true;

    /// <summary>A run ended: out of the in-flight table only while it is still this run's (a newer
    /// run keeps its own), and its answer remembered when worth it.</summary>
    private static void Settle(string scoped, Task<UIIncrementDto> run, bool remember)
    {
        lock (Lock)
        {
            if (!InFlight.TryGetValue(scoped, out var current) || !ReferenceEquals(current, run)) return;
            InFlight.Remove(scoped);
            if (!remember) return;
            Answers[scoped] = new Finished(run, DateTime.UtcNow);
            while (Answers.Count > Math.Max(1, MaxEntries))
                Answers.Remove(Answers.MinBy(e => e.Value.Touched).Key);
        }
    }

    /// <summary>How many keyed runs are in flight (tests).</summary>
    public static int InFlightCount
    {
        get { lock (Lock) return InFlight.Count; }
    }

    /// <summary>Forgets every key (tests).</summary>
    public static void Clear()
    {
        lock (Lock)
        {
            InFlight.Clear();
            Answers.Clear();
        }
    }

    private static string Sha256(string text) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text)));

    private static int EnvNumber(string name, int fallback) =>
        int.TryParse(Environment.GetEnvironmentVariable(name), out var n) && n > 0 ? n : fallback;
}
