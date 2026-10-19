using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Channels;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.AgentPush;

/// <summary>Who calls an MCP push tool (or a UI action): the authenticated principal name, else the
/// SHA-256 of an <c>X-Mateu-Agent-Key</c> of at least 16 characters, else nobody (anonymous).</summary>
internal sealed record AgentCaller(string? Principal, string? KeyHash)
{
    /// <summary>The header the sidecar sends to identify itself when it has no principal.</summary>
    public const string AgentKeyHeader = "X-Mateu-Agent-Key";

    /// <summary>The shortest agent key that identifies a caller.</summary>
    public const int MinKeyLength = 16;

    public static readonly AgentCaller Anonymous = new(null, null);

    /// <summary>The caller from a principal name (null/blank = none) and the agent-key header.</summary>
    public static AgentCaller From(string? principal, string? agentKey)
    {
        if (!string.IsNullOrWhiteSpace(principal)) return new AgentCaller(principal, null);
        var key = agentKey?.Trim();
        if (key is { Length: >= MinKeyLength }) return new AgentCaller(null, AgentSessions.Sha256(key));
        return Anonymous;
    }

    /// <summary><c>user:&lt;name&gt;</c>, <c>key:&lt;sha256&gt;</c>, or null when anonymous.</summary>
    public string? Id => Principal is not null ? "user:" + Principal : KeyHash is not null ? "key:" + KeyHash : null;

    /// <summary>How the UI names this caller on its "Connect AI" control.</summary>
    public string Label => Principal ?? "an agent";

    /// <summary>How the delivery log names this caller: the user, a key prefix, or anonymous.</summary>
    public string LogLabel => Principal ?? (Id is { } id ? id[..Math.Min(id.Length, 16)] : "anonymous");
}

/// <summary>One open stream of a UI session: the messages it is sent, in order. Completed when the
/// session opens a newer channel (the old stream ends) or the session is forgotten.</summary>
internal sealed class AgentChannel
{
    internal AgentChannel(AgentSession session)
    {
        Session = session;
        // Bounded: a reader that stopped reading must not grow memory without limit (the rate limit
        // already caps what an agent may send).
        Queue = Channel.CreateBounded<UIIncrementDto>(new BoundedChannelOptions(1024)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
        });
    }

    public AgentSession Session { get; }

    /// <summary>The increments to stream; the SSE endpoint also writes its heartbeats here.</summary>
    public Channel<UIIncrementDto> Queue { get; }
}

/// <summary>A registered UI session (a browser tab, an app window, an IDE project).</summary>
internal sealed class AgentSession
{
    internal AgentSession(string sessionId, string handle, string secretHash, string? principal, string owner,
        long registeredOrder)
    {
        Owner = owner;
        SessionId = sessionId;
        Handle = handle;
        SecretHash = secretHash;
        Principal = principal;
        RegisteredOrder = registeredOrder;
    }

    public string SessionId { get; }
    public string Handle { get; }
    public string SecretHash { get; }
    public string? Principal { get; }

    /// <summary>Who the session counts against for <c>max-sessions-per-owner</c>: the principal name,
    /// or — for an anonymous UI — its client address (<c>unknown</c> when it cannot tell).</summary>
    public string Owner { get; }
    public long RegisteredOrder { get; }
    public string Route { get; internal set; } = "";
    public string Renderer { get; internal set; } = "";
    public DateTimeOffset ConnectedAt { get; internal set; }
    public bool Connected => Current is not null;
    public DateTimeOffset? DisconnectedAt { get; internal set; }
    internal AgentChannel? Current { get; set; }

    /// <summary>The callers paired to it, in pairing order (Id null = an anonymous caller: the
    /// handle is the capability).</summary>
    internal List<(string? CallerId, string Label)> Pairings { get; } = [];

    internal string? PendingCode { get; set; }
    internal DateTimeOffset PendingCodeExpiresAt { get; set; }
    internal Queue<DateTimeOffset> Sent { get; } = new();
}

/// <summary>
/// The live UI sessions an MCP caller may push UI to (phase C): in memory, process-wide (one per
/// host), thread-safe and bounded. Pinned by <c>conformance/mcp/push.json</c>, shared with the Java
/// and Python backends: registration by the UI's <c>_agent-channel</c>, one-time pairing codes,
/// who may reach a session, and the per-session rolling-minute rate limit.
/// </summary>
internal sealed class AgentSessions
{
    // ── the texts (conformance/mcp/push.json "errors" / "reasons") ────────────────────────────
    public const string Disabled = "Live UI push is not enabled.";
    public const string RateLimited = "Too many messages to this session; try again in a minute.";
    public const string InvalidCode = "Invalid or expired pairing code.";
    public const string TooManyAttempts = "Too many pairing attempts; try again in a minute.";
    public const string DetailTooLarge = "The detail is larger than the 65536-byte limit.";
    public const string ChannelRefused = "This UI session belongs to another channel.";
    public const string TooManySessions = "Too many live UI sessions; try again later.";
    public const string HasErrors = "The definition has errors; nothing was sent.";
    public const string NotAPage = "Only a page (a component, or a layout: envelope) can be pushed.";

    public static string UnknownSession(string session) => $"Unknown session \"{session}\".";
    public static string NotConnected(string session) => $"Session \"{session}\" is not connected.";
    public static string ReservedEvent(string e) => $"Event \"{e}\" is reserved: use mateu_push_ui or mateu_navigate.";
    public static string InvalidEvent(string e) => $"Invalid event name \"{e}\".";
    public static string InvalidTarget(string t) => $"Invalid target \"{t}\": use content, drawer or dialog.";

    // ── the fixed limits ──────────────────────────────────────────────────────────────────────
    public static readonly TimeSpan CodeLifetime = TimeSpan.FromSeconds(300);
    public static readonly TimeSpan DisconnectedLifetime = TimeSpan.FromSeconds(120);
    public const int MaxFailedPairings = 10;
    public const int MaxDetailBytes = 65536;
    public const int MaxRendererLength = 32;
    public const int DefaultRatePerMinute = 30;
    public const int DefaultMaxSessions = 1000;
    public const int DefaultMaxSessionsPerOwner = 20;
    static readonly TimeSpan Minute = TimeSpan.FromMinutes(1);

    /// <summary>The pairing code alphabet: no 0/O, 1/I — read off a screen and typed by a person.</summary>
    public const string CodeAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    // ── the message kinds and their UI events ─────────────────────────────────────────────────
    public const string StatusEvent = "mateu-agent-status";
    public const string RenderEvent = "render-screen";
    public const string NavigateEvent = "navigation-requested";
    public static readonly IReadOnlySet<string> ReservedEvents =
        new HashSet<string>(StringComparer.Ordinal) { RenderEvent, NavigateEvent, "close-requested", StatusEvent };

    /// <summary>The wire command type of a pushed message.</summary>
    public const string CommandType = "AgentPush";

    readonly object _lock = new();
    readonly Dictionary<string, AgentSession> _byId = new(StringComparer.Ordinal);
    readonly Dictionary<string, AgentSession> _byHandle = new(StringComparer.Ordinal);
    readonly Dictionary<string, AgentSession> _byCode = new(StringComparer.Ordinal);
    readonly Dictionary<string, Queue<DateTimeOffset>> _failures = new(StringComparer.Ordinal);
    readonly Func<DateTimeOffset> _clock;
    long _order;

    public AgentSessions(int ratePerMinute = DefaultRatePerMinute, int maxSessions = DefaultMaxSessions,
        int maxSessionsPerOwner = DefaultMaxSessionsPerOwner, Func<DateTimeOffset>? clock = null)
    {
        MaxSessionsPerOwner = maxSessionsPerOwner > 0 ? maxSessionsPerOwner : DefaultMaxSessionsPerOwner;
        RatePerMinute = ratePerMinute > 0 ? ratePerMinute : DefaultRatePerMinute;
        MaxSessions = maxSessions > 0 ? maxSessions : DefaultMaxSessions;
        _clock = clock ?? (() => DateTimeOffset.UtcNow);
    }

    public int RatePerMinute { get; }
    public int MaxSessions { get; }
    public int MaxSessionsPerOwner { get; }

    /// <summary>The owner a NEW session counts against: <c>user:&lt;principal&gt;</c>, else
    /// <c>address:&lt;client address&gt;</c> (<c>unknown</c> when null/blank).</summary>
    internal static string OwnerOf(string? principal, string? clientAddress) =>
        Blank(principal) is { } p ? "user:" + p : "address:" + (Blank(clientAddress)?.Trim() ?? "unknown");

    /// <summary>How many sessions are registered (connected or within their disconnected grace).</summary>
    public int Count
    {
        get { lock (_lock) { Purge(_clock()); return _byId.Count; } }
    }

    // ── the UI side ───────────────────────────────────────────────────────────────────────────

    /// <summary><c>_agent-channel</c>: register the session on its first channel, or check that a later
    /// one comes with the same secret and principal; the new channel replaces the old stream, and its
    /// first message is the session's status. A NEW session is checked against its owner's cap (the
    /// principal, else <paramref name="clientAddress"/>) and then the global one; at either cap the
    /// longest-disconnected session (of that owner / of anyone) is evicted, else it is refused. A
    /// reconnect of a registered session is never refused by either cap.</summary>
    public AgentChannel Open(string sessionId, string secret, string? principal, string? route, string? renderer,
        string? clientAddress = null)
    {
        RequireIds(sessionId, secret);
        lock (_lock)
        {
            var now = _clock();
            Purge(now);
            if (_byId.TryGetValue(sessionId, out var session))
                Check(session, secret, principal);
            else
            {
                var owner = OwnerOf(principal, clientAddress);
                if (_byId.Values.Count(s => s.Owner == owner) >= MaxSessionsPerOwner
                    && !EvictOneDisconnected(s => s.Owner == owner))
                    throw new UserFacingException(TooManySessions);
                if (_byId.Count >= MaxSessions && !EvictOneDisconnected(_ => true))
                    throw new UserFacingException(TooManySessions);
                session = new AgentSession(sessionId, NewHandle(), Sha256(secret), Blank(principal), owner, ++_order);
                _byId[sessionId] = session;
                _byHandle[session.Handle] = session;
            }
            session.Route = route ?? "";
            var r = string.IsNullOrWhiteSpace(renderer) ? "" : renderer.Trim();
            session.Renderer = r.Length > MaxRendererLength ? r[..MaxRendererLength] : r;
            session.ConnectedAt = now;
            session.DisconnectedAt = null;
            session.Current?.Queue.Writer.TryComplete();
            var channel = new AgentChannel(session);
            session.Current = channel;
            channel.Queue.Writer.TryWrite(StatusIncrement(session));
            return channel;
        }
    }

    /// <summary>The stream of <paramref name="channel"/> ended. The session stays registered (pairings
    /// included) for <see cref="DisconnectedLifetime"/>; a newer channel is unaffected.</summary>
    public void Closed(AgentChannel channel)
    {
        lock (_lock)
        {
            channel.Queue.Writer.TryComplete();
            var session = channel.Session;
            if (!ReferenceEquals(session.Current, channel)) return;
            session.Current = null;
            session.DisconnectedAt = _clock();
        }
    }

    /// <summary><c>_agent-pair</c>: a new one-time code for a registered session (the previous unused
    /// one dies). Returns the code as shown, XXXX-XXXX.</summary>
    public string NewPairingCode(string sessionId, string secret, string? principal)
    {
        lock (_lock)
        {
            var session = Registered(sessionId, secret, principal);
            if (session.PendingCode is { } old) _byCode.Remove(old);
            string code;
            do code = RandomCode(); while (_byCode.ContainsKey(code));
            session.PendingCode = code;
            session.PendingCodeExpiresAt = _clock() + CodeLifetime;
            _byCode[code] = session;
            return code[..4] + "-" + code[4..];
        }
    }

    /// <summary><c>_agent-unpair</c>: every pairing of the session removed; its channel is told.</summary>
    public void Unpair(string sessionId, string secret, string? principal)
    {
        lock (_lock)
        {
            var session = Registered(sessionId, secret, principal);
            session.Pairings.Clear();
            Deliver(session, StatusIncrement(session));
        }
    }

    // ── the MCP side ──────────────────────────────────────────────────────────────────────────

    /// <summary><c>mateu_list_sessions</c>: the sessions the caller is signed in as, or paired to it,
    /// most recently registered first. (A session reachable only by its capability is not listed:
    /// the handle is returned only to whoever paired.)</summary>
    public JsonObject List(AgentCaller caller)
    {
        lock (_lock)
        {
            Purge(_clock());
            var list = new JsonArray();
            foreach (var s in _byId.Values.OrderByDescending(s => s.RegisteredOrder))
                if (Owns(caller, s) || PairedTo(caller, s)) list.Add(Entry(s));
            return new JsonObject { ["sessions"] = list };
        }
    }

    /// <summary><c>mateu_pair_session</c>: redeem a code (case-insensitive, the dash optional).</summary>
    public JsonObject Pair(AgentCaller caller, string code)
    {
        lock (_lock)
        {
            var now = _clock();
            Purge(now);
            var bucket = caller.Id ?? "anonymous";
            if (!_failures.TryGetValue(bucket, out var failures)) _failures[bucket] = failures = new();
            while (failures.Count > 0 && now - failures.Peek() >= Minute) failures.Dequeue();
            if (failures.Count >= MaxFailedPairings) throw new UserFacingException(TooManyAttempts);
            var normalized = code.Replace("-", "").Trim().ToUpperInvariant();
            if (!_byCode.TryGetValue(normalized, out var session) || session.PendingCodeExpiresAt <= now)
            {
                failures.Enqueue(now);
                throw new UserFacingException(InvalidCode);
            }
            if (failures.Count == 0) _failures.Remove(bucket);
            _byCode.Remove(normalized);
            session.PendingCode = null;
            // every anonymous pairing is its own (the handle is the capability); a caller pairs once
            if (caller.Id is null || !session.Pairings.Any(p => p.CallerId == caller.Id))
                session.Pairings.Add((caller.Id, caller.Label));
            Deliver(session, StatusIncrement(session));
            MateuLogging.For("Mateu.Mcp").LogInformation(
                "Mateu agent push: caller={Caller} paired session={Session} (user={User})",
                caller.LogLabel, session.Handle, session.Principal);
            return Entry(session);
        }
    }

    /// <summary>The checks every sender makes after its arguments: visibility, then connection.</summary>
    public AgentSession Reachable(AgentCaller caller, string handle)
    {
        lock (_lock)
        {
            Purge(_clock());
            if (!_byHandle.TryGetValue(handle, out var session) || !Visible(caller, session))
                throw new UserFacingException(UnknownSession(handle));
            if (!session.Connected) throw new UserFacingException(NotConnected(handle));
            return session;
        }
    }

    /// <summary>Send one message to a reachable session; the last check is the rate limit.</summary>
    public void Send(AgentSession session, string kind, string @event, JsonNode detail)
    {
        lock (_lock)
        {
            var now = _clock();
            if (!session.Connected) throw new UserFacingException(NotConnected(session.Handle));
            while (session.Sent.Count > 0 && now - session.Sent.Peek() >= Minute) session.Sent.Dequeue();
            if (session.Sent.Count >= RatePerMinute) throw new UserFacingException(RateLimited);
            session.Sent.Enqueue(now);
            Deliver(session, Message(kind, @event, detail));
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────────────────────

    /// <summary>An increment carrying ONE AgentPush command {kind, event, detail}.</summary>
    public static UIIncrementDto Message(string kind, string @event, JsonNode detail) =>
        UIIncrementDto.Of(commands:
        [
            new UICommandDto(null!, CommandType, new JsonObject
            {
                ["kind"] = kind,
                ["event"] = @event,
                ["detail"] = detail.DeepClone(),
            }),
        ]);

    static UIIncrementDto StatusIncrement(AgentSession session)
    {
        var agents = new JsonArray();
        foreach (var p in session.Pairings) agents.Add(p.Label);
        return Message("status", StatusEvent, new JsonObject
        {
            ["paired"] = session.Pairings.Count > 0,
            ["agents"] = agents,
        });
    }

    static void Deliver(AgentSession session, UIIncrementDto increment) =>
        session.Current?.Queue.Writer.TryWrite(increment);

    static JsonObject Entry(AgentSession s) => new()
    {
        ["session"] = s.Handle,
        ["user"] = s.Principal,
        ["route"] = s.Route,
        ["renderer"] = s.Renderer,
        ["connectedAt"] = s.ConnectedAt.UtcDateTime.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'",
            System.Globalization.CultureInfo.InvariantCulture),
        ["connected"] = s.Connected,
        ["paired"] = s.Pairings.Count > 0,
    };

    static bool Owns(AgentCaller caller, AgentSession s) => caller.Principal is not null && caller.Principal == s.Principal;

    static bool PairedTo(AgentCaller caller, AgentSession s) =>
        caller.Id is not null && s.Pairings.Any(p => p.CallerId == caller.Id);

    static bool Visible(AgentCaller caller, AgentSession s) =>
        Owns(caller, s) || PairedTo(caller, s) || (caller.Id is null && s.Pairings.Any(p => p.CallerId is null));

    AgentSession Registered(string sessionId, string secret, string? principal)
    {
        RequireIds(sessionId, secret);
        Purge(_clock());
        // An unregistered session and a foreign one are refused alike.
        if (!_byId.TryGetValue(sessionId, out var session)) throw new UserFacingException(ChannelRefused);
        Check(session, secret, principal);
        return session;
    }

    static void Check(AgentSession session, string secret, string? principal)
    {
        if (!FixedTimeEquals(session.SecretHash, Sha256(secret)) || session.Principal != Blank(principal))
            throw new UserFacingException(ChannelRefused);
    }

    /// <summary>Forget the sessions whose stream ended more than <see cref="DisconnectedLifetime"/>
    /// ago, and the codes past their lifetime.</summary>
    void Purge(DateTimeOffset now)
    {
        foreach (var s in _byId.Values.Where(s => !s.Connected && s.DisconnectedAt is { } at && now - at >= DisconnectedLifetime).ToList())
            Forget(s);
        foreach (var (code, s) in _byCode.Where(kv => kv.Value.PendingCodeExpiresAt <= now).ToList())
        {
            _byCode.Remove(code);
            if (s.PendingCode == code) s.PendingCode = null;
        }
    }

    bool EvictOneDisconnected(Func<AgentSession, bool> among)
    {
        var victim = _byId.Values.Where(s => among(s) && !s.Connected).OrderBy(s => s.DisconnectedAt).FirstOrDefault();
        if (victim is null) return false;
        Forget(victim);
        return true;
    }

    void Forget(AgentSession s)
    {
        _byId.Remove(s.SessionId);
        _byHandle.Remove(s.Handle);
        if (s.PendingCode is { } code) _byCode.Remove(code);
        s.Current?.Queue.Writer.TryComplete();
        s.Current = null;
    }

    /// <summary>A session id (≤ 128 chars) and a secret (≤ 256) are required; anything else is refused
    /// like a foreign session.</summary>
    static void RequireIds(string? sessionId, string? secret)
    {
        if (string.IsNullOrWhiteSpace(sessionId) || sessionId.Length > 128
            || string.IsNullOrWhiteSpace(secret) || secret.Length > 256)
            throw new UserFacingException(ChannelRefused);
    }

    static string? Blank(string? s) => string.IsNullOrWhiteSpace(s) ? null : s;

    /// <summary>An opaque handle: 128 random bits, base64url without padding.</summary>
    static string NewHandle() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(16)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    static string RandomCode()
    {
        var chars = new char[8];
        for (var i = 0; i < chars.Length; i++) chars[i] = CodeAlphabet[RandomNumberGenerator.GetInt32(CodeAlphabet.Length)];
        return new string(chars);
    }

    internal static string Sha256(string text) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text))).ToLowerInvariant();

    static bool FixedTimeEquals(string a, string b) =>
        CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(a), Encoding.ASCII.GetBytes(b));
}
