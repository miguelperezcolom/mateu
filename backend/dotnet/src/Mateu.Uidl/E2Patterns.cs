using System.Collections.Concurrent;

namespace Mateu.Uidl;

// The E2 patterns (compare & merge, app-wide shortcuts, live header values, idle-session warning) —
// C# analogues of the Java uidl types of the same names. EXPERIMENTAL: may change in a minor release.

/// <summary>COMPARE AND MERGE: two (or more) records of the same type side by side, one column per
/// record and one row per field; rows whose values differ are highlighted, each row offers a pick
/// ("use the value from A") plus a free edit when the field is <see cref="MergeField.Editable"/>.
/// The merge button runs <see cref="MergeActionId"/> with <c>_merged</c> (fieldId → value) and
/// <c>_choices</c> (fieldId → record id or "custom") next to <see cref="Parameters"/>. (C#
/// analogue of io.mateu.uidl.data.RecordMerge.)</summary>
public sealed record RecordMerge : ComponentBase
{
    public string? Title { get; init; }
    public IReadOnlyList<MergeRecord> Records { get; init; } = [];
    public IReadOnlyList<MergeField> Fields { get; init; } = [];
    public string? MergeActionId { get; init; }
    /// <summary>The merge button's label; blank = "Merge".</summary>
    public string? MergeLabel { get; init; }
    public IReadOnlyDictionary<string, object?>? Parameters { get; init; }
    /// <summary>Whether the "Show only differences" switch starts on.</summary>
    public bool DifferencesOnly { get; init; }
}

/// <summary>A column of a <see cref="RecordMerge"/>: one of the records compared.</summary>
public sealed record MergeRecord(string? Id, string? Label, string? Caption = null);

/// <summary>A row of a <see cref="RecordMerge"/>: one field and its value in each record (records'
/// order). <see cref="Chosen"/> = the record picked to begin with (null = the first record with a
/// non-blank value); <see cref="Editable"/> also offers a free-text value.</summary>
public sealed record MergeField(string FieldId, string? Label, IReadOnlyList<object?> Values)
{
    public string? Chosen { get; init; }
    public bool Editable { get; init; }

    /// <summary>A row, nothing pre-picked: <c>MergeField.Of("email", "Email", a, b)</c>.</summary>
    public static MergeField Of(string fieldId, string? label, params object?[] values) =>
        new(fieldId, label, values);
}

/// <summary>An APP-WIDE keyboard shortcut on the app class: active on every screen, listed in the
/// "Keyboard shortcuts" overlay (<c>?</c>) and in the command palette. It goes to <see cref="Route"/>
/// or runs the app-level <see cref="ActionId"/> (a method of the app class). <see cref="Code"/> is a
/// quick-launch code typed in the command palette. A screen's own shortcut on the same key wins.
/// (C# analogue of Java's @AppShortcut.)</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class AppShortcutAttribute : Attribute
{
    /// <summary>"f9", "ctrl+alt+r" — the @Action(shortcut) syntax.</summary>
    public string Key { get; set; } = "";
    /// <summary>Where it goes (relative to the app), e.g. "/reservations".</summary>
    public string Route { get; set; } = "";
    /// <summary>Or: the app-level action it runs.</summary>
    public string ActionId { get; set; } = "";
    /// <summary>How it is listed; blank = the route humanized.</summary>
    public string Label { get; set; } = "";
    /// <summary>Quick-launch code typed in the command palette, e.g. "RES".</summary>
    public string Code { get; set; } = "";
}

/// <summary>A LIVE value on the app header ("Business date: 12 Oct"). Changed by
/// <c>UICommandDto.UpdateHeaderValue(id, value)</c> from an action (this browser) or published to
/// every session with <see cref="LiveHeaderValues.Publish"/> when [App(LiveUpdates = true)].</summary>
public sealed record HeaderValue(string Id, string? Label, string? Value);

/// <summary>Implemented by the app class to put live values on the header. (C# analogue of Java's
/// HeaderValuesSupplier.)</summary>
public interface IHeaderValuesSupplier
{
    IReadOnlyList<HeaderValue> HeaderValues();
}

/// <summary>Implemented by the app class to hook the idle warning's "Stay signed in" (the
/// <c>_keep-alive</c> app-level action). Mateu does no authentication. (C# analogue of Java's
/// KeepAliveHandler.)</summary>
public interface IKeepAliveHandler
{
    void KeepAlive();
}

/// <summary>Pushes a new header value to EVERY open session of the app ([App(LiveUpdates = true)]):
/// each browser keeps one event stream open and repaints its header. In-process: in a cluster,
/// publish on every node. The last value of each id is kept, so a session connecting later catches
/// up. (C# analogue of io.mateu.uidl.LiveHeaderValues.)</summary>
public static class LiveHeaderValues
{
    private static readonly ConcurrentDictionary<string, string> CurrentValues = new();
    private static readonly List<Action<HeaderValue>> Listeners = [];
    private static readonly object Lock = new();

    /// <summary>Publishes <paramref name="value"/> for the header value <paramref name="id"/>.</summary>
    public static void Publish(string id, string? value)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("a header value needs an id", nameof(id));
        var text = value ?? "";
        CurrentValues[id] = text;
        Action<HeaderValue>[] listeners;
        lock (Lock) listeners = Listeners.ToArray();
        var change = new HeaderValue(id, null, text);
        foreach (var listener in listeners)
        {
            try { listener(change); }
            catch { /* one broken stream must not stop the others */ }
        }
    }

    /// <summary>The last value published for each id.</summary>
    public static IReadOnlyDictionary<string, string> Current => new Dictionary<string, string>(CurrentValues);

    /// <summary>Listens to every publish until the returned handle is disposed.</summary>
    public static IDisposable Subscribe(Action<HeaderValue> listener)
    {
        lock (Lock) Listeners.Add(listener);
        return new Unsubscriber(listener);
    }

    /// <summary>Forgets every published value (tests).</summary>
    public static void Reset() => CurrentValues.Clear();

    private sealed class Unsubscriber(Action<HeaderValue> listener) : IDisposable
    {
        public void Dispose()
        {
            lock (Lock) Listeners.Remove(listener);
        }
    }
}
