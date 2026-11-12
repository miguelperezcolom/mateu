using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Mateu.Dtos;

namespace Mateu.Core;

/// <summary>
/// The server half of the offline send queue (Java's <c>io.mateu.core.infra.idempotency.IdempotencyKeys</c>):
/// a sync request carrying an <c>Idempotency-Key</c> header runs ONCE per caller, action and key;
/// a repeat gets the first answer back, and a repeat arriving while the first run is in flight
/// joins it. Remembered in memory, per process: bounded (<see cref="MaxEntries"/>, least recently
/// used first out) and for <see cref="Ttl"/> (24 h). A run that throws or answers an error message
/// (a refusal, the error boundary's) is forgotten, so the key can be sent again.
/// </summary>
public static partial class IdempotencyKeys
{
    /// <summary>The request header carrying the key (the IETF httpapi draft's name).</summary>
    public const string Header = "Idempotency-Key";

    /// <summary>How many answers are remembered (env <c>MATEU_IDEMPOTENCY_MAX_ENTRIES</c>).</summary>
    public static int MaxEntries { get; set; } = EnvNumber("MATEU_IDEMPOTENCY_MAX_ENTRIES", 2000);

    /// <summary>How long an answer is remembered (env <c>MATEU_IDEMPOTENCY_TTL_SECONDS</c>).</summary>
    public static TimeSpan Ttl { get; set; } = TimeSpan.FromSeconds(EnvNumber("MATEU_IDEMPOTENCY_TTL_SECONDS", 24 * 60 * 60));

    private sealed record Entry(Task<UIIncrementDto> Answer, DateTime CreatedAt)
    {
        public DateTime Touched { get; set; } = CreatedAt;
    }

    private static readonly Dictionary<string, Entry> Answers = new();

    [GeneratedRegex("^[A-Za-z0-9_\\-:.]{8,128}$")]
    private static partial Regex Valid();

    /// <summary>The key, or null when the header is missing or does not look like a key.</summary>
    public static string? KeyOf(string? header)
    {
        if (string.IsNullOrWhiteSpace(header)) return null;
        var trimmed = header.Trim();
        return Valid().IsMatch(trimmed) ? trimmed : null;
    }

    /// <summary>Runs <paramref name="run"/> unless <paramref name="caller"/> already sent
    /// <paramref name="key"/> for <paramref name="actionId"/>; then the first answer is replayed.
    /// <paramref name="caller"/> is any stable text naming the authenticated caller (hashed here).</summary>
    public static Task<UIIncrementDto> OnceAsync(
        string? caller, string? actionId, string? key, Func<Task<UIIncrementDto>> run)
    {
        if (KeyOf(key) is not { } valid) return run();
        var scoped = Sha256((caller ?? "") + "\u0002" + (actionId ?? "") + "\u0002" + valid);
        TaskCompletionSource<UIIncrementDto> answer;
        lock (Answers)
        {
            var now = DateTime.UtcNow;
            if (Answers.TryGetValue(scoped, out var known) && now - known.CreatedAt <= Ttl)
            {
                known.Touched = now;
                return known.Answer;
            }
            // remembered BEFORE the run starts: a run that fails synchronously must find its entry
            // to forget it, and a repeat arriving meanwhile must find it to join it
            answer = new TaskCompletionSource<UIIncrementDto>(TaskCreationOptions.RunContinuationsAsynchronously);
            Answers[scoped] = new Entry(answer.Task, now);
            while (Answers.Count > Math.Max(1, MaxEntries))
                Answers.Remove(Answers.MinBy(e => e.Value.Touched).Key);
        }
        _ = RunAndForgetOnFailure(scoped, run, answer);
        return answer.Task;
    }

    private static async Task RunAndForgetOnFailure(
        string scoped, Func<Task<UIIncrementDto>> run, TaskCompletionSource<UIIncrementDto> answer)
    {
        try
        {
            var increment = await run().ConfigureAwait(false);
            if (Refused(increment)) Forget(scoped, answer.Task);
            answer.SetResult(increment);
        }
        catch (Exception e)
        {
            Forget(scoped, answer.Task);
            answer.SetException(e);
        }
    }

    /// <summary>Whether an answer refused the request: nothing to remember.</summary>
    public static bool Refused(UIIncrementDto? increment) =>
        increment?.Messages?.Any(m => m is not null && m.Variant == "error") == true;

    /// <summary>Forgets the entry only while it is still this run's (a newer run keeps its own).</summary>
    private static void Forget(string scoped, Task<UIIncrementDto> run)
    {
        lock (Answers)
        {
            if (Answers.TryGetValue(scoped, out var known) && ReferenceEquals(known.Answer, run))
                Answers.Remove(scoped);
        }
    }

    /// <summary>Forgets every key (tests).</summary>
    public static void Clear()
    {
        lock (Answers) Answers.Clear();
    }

    private static string Sha256(string text) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text)));

    private static int EnvNumber(string name, int fallback) =>
        int.TryParse(Environment.GetEnvironmentVariable(name), out var n) && n > 0 ? n : fallback;
}
