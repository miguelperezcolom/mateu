using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>RECORD PRESENCE (<c>[App(Presence = true)]</c>): who else has a record page open, and
/// who is editing it. A record is its mount-relative route (no query, no surrounding slashes, a
/// trailing <c>/edit</c> or <c>/view</c> dropped) plus the view class; a create page is none. A
/// scope is one app (base url + app class). Only signed-in callers take part. A tab reports itself
/// every <see cref="HeartbeatSeconds"/> s; a copy not seen for <see cref="TtlSeconds"/> s is gone.
/// (Mirrors Java's io.mateu.core.application.presence.Presence.) EXPERIMENTAL.</summary>
public static class Presence
{
    public const string ActionId = "_presence";
    public const int HeartbeatSeconds = 10;
    public const int TtlSeconds = 30;
    internal const int MaxTabLength = 64;
    internal const int MaxRouteLength = 512;
    internal const int MaxNameLength = 80;

    /// <summary>The process-wide default store (the app's IPresenceStore service replaces it).</summary>
    public static readonly InMemoryPresenceStore DefaultStore = new();

    /// <summary>The clock — replaceable by tests.</summary>
    public static Func<DateTimeOffset> Clock { get; set; } = () => DateTimeOffset.UtcNow;

    private static long _lastSweep;

    /// <summary>The app a request belongs to.</summary>
    public static string ScopeOf(string? baseUrl, string? appType) => (baseUrl ?? "") + "|" + (appType ?? "");

    /// <summary>The record a page is (route + "|" + view class); null when it is none.</summary>
    public static string? RecordOf(string? route, string? view)
    {
        if (route is null) return null;
        var path = route;
        var cut = path.IndexOf('?');
        if (cut >= 0) path = path[..cut];
        cut = path.IndexOf('#');
        if (cut >= 0) path = path[..cut];
        path = Regex.Replace(path, "/{2,}", "/").Trim('/');
        if (path.EndsWith("/edit", StringComparison.Ordinal)) path = path[..^"/edit".Length];
        else if (path.EndsWith("/view", StringComparison.Ordinal)) path = path[..^"/view".Length];
        if (path.Length == 0 || path == "new" || path.EndsWith("/new", StringComparison.Ordinal)
            || path.Length > MaxRouteLength) return null;
        var viewClass = view?.Trim() ?? "";
        if (viewClass.Length > MaxRouteLength) return null;
        return path + "|" + viewClass;
    }

    /// <summary>The OTHER people on <paramref name="record"/> for <paramref name="principal"/>: one
    /// entry per person, editing if any of their tabs edits.</summary>
    public static PresenceDto Snapshot(IPresenceStore store, string scope, string record, string? principal)
    {
        var byPerson = new Dictionary<string, PresenceEntryDto>();
        var order = new List<string>();
        foreach (var m in store.Members(scope, record, Clock().AddSeconds(-TtlSeconds)))
        {
            if (m.Principal is null || m.Principal == principal) continue;
            var since = m.Since.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.FFFFFFF'Z'");
            if (byPerson.TryGetValue(m.Principal, out var known))
                byPerson[m.Principal] = known with { Editing = known.Editing || m.Editing };
            else
            {
                order.Add(m.Principal);
                byPerson[m.Principal] = new PresenceEntryDto(m.Name, m.Editing, since);
            }
        }
        return new PresenceDto(record, order.Select(p => byPerson[p]).ToList());
    }

    /// <summary>Whether <paramref name="principal"/> has the record open in any tab.</summary>
    public static bool IsOn(IPresenceStore store, string scope, string record, string? principal) =>
        principal is not null && store.Members(scope, record, Clock().AddSeconds(-TtlSeconds))
            .Any(m => m.Principal == principal);

    public static bool Touch(IPresenceStore store, string scope, string record, string principal, string? tab, bool editing)
    {
        var now = Clock();
        return store.Touch(scope, record,
            new PresenceMember(principal, Clip(principal, MaxNameLength)!, Clip(tab, MaxTabLength), editing, now, now));
    }

    public static void Leave(IPresenceStore store, string scope, string record, string principal, string? tab) =>
        store.Leave(scope, record, principal, Clip(tab, MaxTabLength));

    /// <summary>Forgets the copies whose tab went silent — at most every few seconds.</summary>
    public static void Sweep(IPresenceStore store)
    {
        var now = Clock().ToUnixTimeMilliseconds();
        var last = Interlocked.Read(ref _lastSweep);
        if (now - last < 5_000 && now >= last) return;
        if (Interlocked.CompareExchange(ref _lastSweep, now, last) != last) return;
        store.Expire(Clock().AddSeconds(-TtlSeconds));
    }

    /// <summary>Lets the next Sweep run at once (tests).</summary>
    public static void ResetSweep() => Interlocked.Exchange(ref _lastSweep, 0);

    public static UICommandDto Command(PresenceDto presence) => new(null!, "PresenceChanged", presence);

    private static string? Clip(string? value, int max) =>
        value is null ? null : value.Length > max ? value[..max] : value;
}

/// <summary>Mateu's default <see cref="IPresenceStore"/>: in memory, per process, bounded —
/// <see cref="MaxRecords"/> open records, <see cref="MaxMembersPerRecord"/> copies per record and
/// <see cref="MaxCopiesPerPrincipal"/> per principal (beyond a bound a touch is refused; nothing is
/// evicted). (Mirrors Java's InMemoryPresenceStore.) EXPERIMENTAL.</summary>
public sealed class InMemoryPresenceStore : IPresenceStore
{
    public const int MaxRecords = 10_000;
    public const int MaxMembersPerRecord = 50;
    public const int MaxCopiesPerPrincipal = 50;

    private readonly object _lock = new();
    private readonly Dictionary<(string Scope, string Record), Dictionary<(string, string), PresenceMember>> _records = new();
    private readonly Dictionary<string, int> _copies = new();
    private readonly List<Action<string, string>> _listeners = new();

    public bool Touch(string scope, string record, PresenceMember member)
    {
        if (scope is null || record is null || member?.Principal is null) return false;
        bool changed;
        lock (_lock)
        {
            _records.TryGetValue((scope, record), out var members);
            var key = (member.Principal, member.Tab ?? "");
            PresenceMember? previous = null;
            members?.TryGetValue(key, out previous);
            if (previous is null)
            {
                if (members is null && _records.Count >= MaxRecords) return false;
                if (members is not null && members.Count >= MaxMembersPerRecord) return false;
                if (_copies.GetValueOrDefault(member.Principal) >= MaxCopiesPerPrincipal) return false;
                if (members is null) _records[(scope, record)] = members = new();
                _copies[member.Principal] = _copies.GetValueOrDefault(member.Principal) + 1;
            }
            members![key] = previous is null ? member : member with { Since = previous.Since };
            changed = previous is null || previous.Editing != member.Editing || previous.Name != member.Name;
        }
        if (changed) Notify(scope, record);
        return true;
    }

    public void Leave(string scope, string record, string principal, string? tab)
    {
        bool removed;
        lock (_lock)
        {
            removed = _records.TryGetValue((scope, record), out var members) && members.Remove((principal, tab ?? ""));
            if (removed)
            {
                Release(principal);
                if (members!.Count == 0) _records.Remove((scope, record));
            }
        }
        if (removed) Notify(scope, record);
    }

    public IReadOnlyList<PresenceMember> Members(string scope, string record, DateTimeOffset? seenAfter)
    {
        lock (_lock)
        {
            if (!_records.TryGetValue((scope, record), out var members)) return [];
            return members.Values.Where(m => seenAfter is null || m.LastSeen > seenAfter)
                .OrderBy(m => m.Since).ToList();
        }
    }

    public void Expire(DateTimeOffset seenBefore)
    {
        var changed = new List<(string, string)>();
        lock (_lock)
        {
            foreach (var (key, members) in _records.ToList())
            {
                var stale = members.Where(m => m.Value.LastSeen < seenBefore).Select(m => m.Key).ToList();
                foreach (var s in stale)
                {
                    Release(members[s].Principal);
                    members.Remove(s);
                }
                if (stale.Count > 0) changed.Add(key);
                if (members.Count == 0) _records.Remove(key);
            }
        }
        foreach (var (scope, record) in changed) Notify(scope, record);
    }

    public IDisposable OnChange(Action<string, string> listener)
    {
        lock (_listeners) _listeners.Add(listener);
        return new Subscription(() => { lock (_listeners) _listeners.Remove(listener); });
    }

    /// <summary>How many records have someone on them (tests).</summary>
    public int Count
    {
        get { lock (_lock) return _records.Count; }
    }

    private void Release(string principal)
    {
        if (!_copies.TryGetValue(principal, out var n)) return;
        if (n <= 1) _copies.Remove(principal);
        else _copies[principal] = n - 1;
    }

    private void Notify(string scope, string record)
    {
        Action<string, string>[] listeners;
        lock (_listeners) listeners = _listeners.ToArray();
        foreach (var listener in listeners)
        {
            try { listener(scope, record); }
            catch (Exception) { /* one broken stream must not stop the others */ }
        }
    }

    private sealed class Subscription(Action dispose) : IDisposable
    {
        public void Dispose() => dispose();
    }
}
