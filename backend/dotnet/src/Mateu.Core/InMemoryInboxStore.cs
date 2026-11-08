using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Mateu's default <see cref="IInboxStore"/>: in memory, per process, bounded —
/// <see cref="MaxEntriesPerPrincipal"/> entries per principal (newest kept) and
/// <see cref="MaxPrincipals"/> principals (least recently used dropped first). Lost on restart; an
/// app that needs durable entries registers its own store. (Mirrors Java's InMemoryInboxStore.)
/// EXPERIMENTAL.</summary>
public sealed class InMemoryInboxStore : IInboxStore
{
    public const int MaxEntriesPerPrincipal = 100;
    public const int MaxPrincipals = 10_000;

    private readonly object _lock = new();
    // principal → entries, OLDEST first; the LRU order of principals rides the linked list
    private readonly Dictionary<string, (LinkedListNode<string> Node, List<AppNotification> Entries)> _inboxes = new();
    private readonly LinkedList<string> _recency = new();

    public void Add(string principal, AppNotification entry)
    {
        lock (_lock)
        {
            var entries = Touch(principal, create: true)!;
            entries.RemoveAll(e => e.Id == entry.Id);
            entries.Add(entry);
            if (entries.Count > MaxEntriesPerPrincipal) entries.RemoveRange(0, entries.Count - MaxEntriesPerPrincipal);
        }
    }

    public IReadOnlyList<AppNotification> List(string principal)
    {
        lock (_lock)
        {
            var entries = Touch(principal, create: false);
            return entries is null ? [] : Enumerable.Reverse(entries).ToList();
        }
    }

    public void MarkRead(string principal, IReadOnlyList<string> ids)
    {
        lock (_lock)
        {
            var entries = Touch(principal, create: false);
            if (entries is null) return;
            for (var i = 0; i < entries.Count; i++)
                if (ids.Contains(entries[i].Id)) entries[i] = entries[i] with { Unread = false };
        }
    }

    public void Dismiss(string principal, IReadOnlyList<string> ids)
    {
        lock (_lock) Touch(principal, create: false)?.RemoveAll(e => ids.Contains(e.Id));
    }

    private List<AppNotification>? Touch(string principal, bool create)
    {
        if (_inboxes.TryGetValue(principal, out var inbox))
        {
            _recency.Remove(inbox.Node);
            _recency.AddLast(inbox.Node);
            return inbox.Entries;
        }
        if (!create) return null;
        var node = _recency.AddLast(principal);
        var entries = new List<AppNotification>();
        _inboxes[principal] = (node, entries);
        while (_inboxes.Count > MaxPrincipals && _recency.First is { } oldest)
        {
            _recency.RemoveFirst();
            _inboxes.Remove(oldest.Value);
        }
        return entries;
    }
}
