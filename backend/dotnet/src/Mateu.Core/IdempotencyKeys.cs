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

    /// <summary>Title of the refusal when a key is sent again with a DIFFERENT request (same in the 3 backends).</summary>
    public const string ReusedTitle = "Idempotency key reused";

    /// <summary>Text of the refusal when a key is sent again with a different request.</summary>
    public const string ReusedMessage = "This key was already used for a different request. Send this one with a new key.";

    /// <summary>How many runs may be in flight, and how many finished answers are remembered
    /// (env <c>MATEU_IDEMPOTENCY_MAX_ENTRIES</c>).</summary>
    public static int MaxEntries { get; set; } = EnvNumber("MATEU_IDEMPOTENCY_MAX_ENTRIES", 2000);

    /// <summary>Each caller's share of either table (env <c>MATEU_IDEMPOTENCY_MAX_ENTRIES_PER_CALLER</c>,
    /// Java's <c>mateu.idempotency.max-entries-per-caller</c>): past it in flight a NEW key is refused
    /// (<see cref="BusyTitle"/>); past it finished, the caller's own least recently used answer goes —
    /// never another caller's (GA review S10).</summary>
    public static int MaxEntriesPerCaller { get; set; } = EnvNumber("MATEU_IDEMPOTENCY_MAX_ENTRIES_PER_CALLER", 100);

    /// <summary>How long an answer is remembered (env <c>MATEU_IDEMPOTENCY_TTL_SECONDS</c>).</summary>
    public static TimeSpan Ttl { get; set; } = TimeSpan.FromSeconds(EnvNumber("MATEU_IDEMPOTENCY_TTL_SECONDS", 24 * 60 * 60));

    private sealed class Finished(Task<UIIncrementDto> answer, DateTime createdAt, string caller, string? fingerprint)
    {
        public Task<UIIncrementDto> Answer { get; } = answer;
        public DateTime CreatedAt { get; } = createdAt;
        public DateTime Touched { get; set; } = createdAt;
        public string Caller { get; } = caller;
        public string? Fingerprint { get; } = fingerprint;
    }

    private sealed record Running(Task<UIIncrementDto> Answer, string Caller, string? Fingerprint);

    private static readonly object Lock = new();
    /// <summary>Runs not finished yet: never evicted, admission bounded (in all, and per caller).</summary>
    private static readonly Dictionary<string, Running> InFlight = new();
    /// <summary>Answers of finished runs: LRU + TTL, each caller's share bounded on its own.</summary>
    private static readonly Dictionary<string, Finished> Answers = new();
    /// <summary>How many entries each caller (its hash) holds in either table.</summary>
    private static readonly Dictionary<string, int> InFlightByCaller = new();
    private static readonly Dictionary<string, int> AnswersByCaller = new();

    private static int CountOf(Dictionary<string, int> counts, string caller) => counts.GetValueOrDefault(caller);

    private static void Count(Dictionary<string, int> counts, string caller) =>
        counts[caller] = counts.GetValueOrDefault(caller) + 1;

    private static void Uncount(Dictionary<string, int> counts, string caller)
    {
        if (!counts.TryGetValue(caller, out var n)) return;
        if (n <= 1) counts.Remove(caller);
        else counts[caller] = n - 1;
    }

    private static void RemoveAnswer(string scoped)
    {
        if (Answers.Remove(scoped, out var gone)) Uncount(AnswersByCaller, gone.Caller);
    }

    /// <summary>A new keyed run may start: not past the table's bound nor the caller's share.</summary>
    private static void Admit(string caller)
    {
        if (InFlight.Count >= Math.Max(1, MaxEntries) || CountOf(InFlightByCaller, caller) >= Math.Max(1, MaxEntriesPerCaller))
            throw new UserFacingException(BusyTitle, BusyMessage);
    }

    /// <summary>The same key sent with ANOTHER request is not a retry: answering it with the first
    /// request's answer would hide that it never ran.</summary>
    private static void RefuseAnotherRequest(string? known, string? sent)
    {
        if (known is not null && sent is not null && known != sent)
            throw new UserFacingException(ReusedTitle, ReusedMessage);
    }

    private static void StartRun(string scoped, string caller, string? fingerprint, Task<UIIncrementDto> task)
    {
        InFlight[scoped] = new Running(task, caller, fingerprint);
        Count(InFlightByCaller, caller);
    }

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
        string? caller, string? actionId, string? key, Func<Task<UIIncrementDto>> run,
        string? view = null, string? route = null, string? fingerprint = null)
    {
        if (KeyOf(key) is not { } valid) return run();
        var scoped = Scoped(caller, view, route, actionId, valid);
        var callerHash = Sha256(caller ?? "");
        TaskCompletionSource<UIIncrementDto> answer;
        lock (Lock)
        {
            var now = DateTime.UtcNow;
            try
            {
                if (Answers.TryGetValue(scoped, out var known))
                {
                    if (now - known.CreatedAt <= Ttl)
                    {
                        RefuseAnotherRequest(known.Fingerprint, fingerprint);
                        known.Touched = now;
                        return known.Answer;
                    }
                    RemoveAnswer(scoped);
                }
                if (InFlight.TryGetValue(scoped, out var running))
                {
                    RefuseAnotherRequest(running.Fingerprint, fingerprint);
                    return running.Answer;
                }
                Admit(callerHash);
            }
            catch (UserFacingException refused)
            {
                return Task.FromException<UIIncrementDto>(refused);
            }
            // registered BEFORE the run starts: a run that fails synchronously must find its entry
            // to forget it, and a repeat arriving meanwhile must find it to join it
            answer = new TaskCompletionSource<UIIncrementDto>(TaskCreationOptions.RunContinuationsAsynchronously);
            StartRun(scoped, callerHash, fingerprint, answer.Task);
        }
        _ = RunAndSettle(scoped, run, answer);
        return answer.Task;
    }

    /// <summary>The view a key belongs to, normalised the same way in the three backends: the
    /// request's server side type (trimmed) and its route (trimmed, without leading or trailing
    /// slashes) — the same caller, key and action id on another view is another entry.</summary>
    public static string ViewOf(string? serverSideType, string? route) =>
        "type=" + (serverSideType ?? "").Trim() + "\u0001route=" + (route ?? "").Trim().Trim('/');

    private static string Scoped(string? caller, string? view, string? route, string? actionId, string valid) =>
        Sha256((caller ?? "") + "\u0002" + ViewOf(view, route) + "\u0002" + (actionId ?? "") + "\u0002" + valid);

    // ── Deduplication AFTER the request checks (the sync endpoint) ─────────────────────────────

    /// <summary>A keyed request going through the handler: not claimed until the handler reaches a
    /// <see cref="Checkpoint"/>, i.e. until the request passed the checks its action would pass.</summary>
    private sealed class Pending(string scoped, string caller, string? fingerprint)
    {
        public string Scoped { get; } = scoped;
        public string Caller { get; } = caller;
        public string? Fingerprint { get; } = fingerprint;
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
    /// <para>A keyed run is DETACHED from the request: <paramref name="listen"/> (the request's
    /// abort) only stops the waiting, never the run — a client that leaves neither cancels the work
    /// nor frees the key while the write may still land, and a retry of the key joins the run (pass
    /// the handler a token that does not end with the request). <paramref name="fingerprint"/>
    /// (<see cref="FingerprintOf"/>) tells a retry from another request reusing the key.</para>
    public static async Task<UIIncrementDto> GuardedAsync(
        string? caller, string? actionId, string? key, Func<Task<UIIncrementDto>> run,
        string? view = null, string? route = null, string? fingerprint = null, CancellationToken listen = default)
    {
        if (KeyOf(key) is not { } valid) return await run().ConfigureAwait(false);
        var pending = new Pending(Scoped(caller, view, route, actionId, valid), Sha256(caller ?? ""), fingerprint);
        var work = Detached(pending, run);
        // observed even when nobody listens any more (the client left)
        _ = work.ContinueWith(t => _ = t.Exception, CancellationToken.None,
            TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously, TaskScheduler.Default);
        return await work.WaitAsync(listen).ConfigureAwait(false);
    }

    private static async Task<UIIncrementDto> Detached(Pending pending, Func<Task<UIIncrementDto>> run)
    {
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
                    RefuseAnotherRequest(known.Fingerprint, pending.Fingerprint);
                    known.Touched = now;
                    throw new Replay(known.Answer);
                }
                RemoveAnswer(pending.Scoped);
            }
            if (InFlight.TryGetValue(pending.Scoped, out var running))
            {
                RefuseAnotherRequest(running.Fingerprint, pending.Fingerprint);
                throw new Replay(running.Answer);
            }
            Admit(pending.Caller);
            var mine = new TaskCompletionSource<UIIncrementDto>(TaskCreationOptions.RunContinuationsAsynchronously);
            StartRun(pending.Scoped, pending.Caller, pending.Fingerprint, mine.Task);
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
            if (!InFlight.TryGetValue(scoped, out var current) || !ReferenceEquals(current.Answer, run)) return;
            InFlight.Remove(scoped);
            Uncount(InFlightByCaller, current.Caller);
            if (!remember) return;
            RemoveAnswer(scoped);
            // the caller's share full: its OWN least recently used answer goes, never another's
            while (CountOf(AnswersByCaller, current.Caller) >= Math.Max(1, MaxEntriesPerCaller))
                RemoveAnswer(Answers.Where(e => e.Value.Caller == current.Caller).MinBy(e => e.Value.Touched).Key);
            Answers[scoped] = new Finished(run, DateTime.UtcNow, current.Caller, current.Fingerprint);
            Count(AnswersByCaller, current.Caller);
            while (Answers.Count > Math.Max(1, MaxEntries))
                RemoveAnswer(Answers.MinBy(e => e.Value.Touched).Key);
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
            InFlightByCaller.Clear();
            AnswersByCaller.Clear();
        }
    }

    /// <summary>What a request asks for — its component state and parameters as canonical JSON
    /// (object keys sorted at every level) — hashed: the same key with another fingerprint is another
    /// request (Java's IdempotencyKeys.fingerprint).</summary>
    public static string FingerprintOf(IReadOnlyDictionary<string, object?>? componentState,
        IReadOnlyDictionary<string, object?>? parameters)
    {
        var body = new System.Text.Json.Nodes.JsonObject
        {
            ["componentState"] = Canonical(System.Text.Json.JsonSerializer.SerializeToNode(componentState ?? new Dictionary<string, object?>())),
            ["parameters"] = Canonical(System.Text.Json.JsonSerializer.SerializeToNode(parameters ?? new Dictionary<string, object?>())),
        };
        return Sha256(body.ToJsonString());
    }

    private static System.Text.Json.Nodes.JsonNode? Canonical(System.Text.Json.Nodes.JsonNode? node) => node switch
    {
        System.Text.Json.Nodes.JsonObject o => new System.Text.Json.Nodes.JsonObject(o
            .OrderBy(p => p.Key, StringComparer.Ordinal)
            .Select(p => KeyValuePair.Create(p.Key, Canonical(p.Value)))),
        System.Text.Json.Nodes.JsonArray a => new System.Text.Json.Nodes.JsonArray(a.Select(Canonical).ToArray()),
        null => null,
        _ => node.DeepClone(),
    };

    private static string Sha256(string text) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text)));

    private static int EnvNumber(string name, int fallback) =>
        int.TryParse(Environment.GetEnvironmentVariable(name), out var n) && n > 0 ? n : fallback;
}
