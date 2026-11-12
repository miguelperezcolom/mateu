namespace Mateu.Uidl;

/// <summary>One open copy of a record page (record presence, <c>[App(Presence = true)]</c>): who
/// has it open (in which tab), whether they are EDITING it (the page holds unsaved changes) and
/// since when — what an <see cref="IPresenceStore"/> keeps. <c>Principal</c> is the name of the
/// identity the host authenticated, never a value from the browser; a copy not seen for 30 seconds
/// is gone. (Mirrors io.mateu.uidl.data.PresenceMember.) EXPERIMENTAL.</summary>
public sealed record PresenceMember(
    string Principal, string Name, string? Tab, bool Editing, DateTimeOffset Since, DateTimeOffset LastSeen);

/// <summary>Where record presence ("Ana is editing this record") is kept. Mateu ships UI only: out
/// of the box an in-memory store is used — per process, bounded, lost on restart — so users on
/// DIFFERENT nodes do not see each other; register a service implementing this interface (Redis, a
/// shared cache) to share it. A <c>scope</c> is one app, a <c>record</c> one record page within it —
/// opaque strings Mateu builds; a store never mixes scopes. (Mirrors
/// io.mateu.uidl.interfaces.PresenceStore.) EXPERIMENTAL.</summary>
public interface IPresenceStore
{
    /// <summary>Records (or refreshes) one open copy of <paramref name="record"/>, keyed by its
    /// principal + tab; false when a bound of the store refused it.</summary>
    bool Touch(string scope, string record, PresenceMember member);

    /// <summary>That tab closed the record (or left it).</summary>
    void Leave(string scope, string record, string principal, string? tab);

    /// <summary>The copies of <paramref name="record"/> last seen after <paramref name="seenAfter"/>,
    /// the oldest first.</summary>
    IReadOnlyList<PresenceMember> Members(string scope, string record, DateTimeOffset? seenAfter);

    /// <summary>Forgets every copy last seen before <paramref name="seenBefore"/>, telling the
    /// <see cref="OnChange"/> listeners about the records it changed. A store with its own TTL can
    /// leave it empty.</summary>
    void Expire(DateTimeOffset seenBefore) { }

    /// <summary>Listens to every change (scope, record) until the handle is disposed. A store that
    /// cannot tell (the default) still works: the others see the change on their next heartbeat.</summary>
    IDisposable OnChange(Action<string, string> listener) => new NoSubscription();

    private sealed class NoSubscription : IDisposable
    {
        public void Dispose() { }
    }
}
