namespace Mateu.Uidl;

/// <summary>What the visual editor changed about a screen's layout, expressed as a DELTA over the
/// inferred one rather than as a snapshot of the result (the <c>layoutDelta:</c> key of a YAML
/// definition). It records the DECISIONS a human made — this field first, that one hidden, this one
/// wider — anchored to stable field ids. Inference still runs on every request and the delta is
/// re-applied on top: a field the model grows is one the delta says nothing about, so it appears in
/// its inferred place; a field the model loses is an entry that matches nothing and is ignored.
/// (C# analogue of io.mateu.uidl.data.LayoutDelta.)</summary>
public sealed record LayoutDelta
{
    /// <summary>Per-field tweaks a human made. Every member is optional; null means "leave as
    /// inferred". Section is carried (Java parity) but, as in Java, not applied: a delta cannot move a
    /// field between containers.</summary>
    public sealed record FieldOverride(string? Label = null, int? Colspan = null, string? Section = null);

    public IReadOnlyList<string> Order { get; }
    public IReadOnlyList<string> Hidden { get; }
    public IReadOnlyDictionary<string, FieldOverride> Overrides { get; }

    public LayoutDelta(IEnumerable<string>? order = null, IEnumerable<string>? hidden = null,
        IReadOnlyDictionary<string, FieldOverride>? overrides = null)
    {
        Order = order?.ToList() ?? [];
        Hidden = hidden?.ToList() ?? [];
        Overrides = overrides is null
            ? new Dictionary<string, FieldOverride>()
            : new Dictionary<string, FieldOverride>(overrides);
    }

    public static LayoutDelta Empty { get; } = new();

    public bool IsEmpty => Order.Count == 0 && Hidden.Count == 0 && Overrides.Count == 0;

    /// <summary>The field ids to render, in order, given what inference produced. Fields the delta
    /// does not mention keep their inferred position: listed ones come first in the chosen order,
    /// the rest follow in inferred order.</summary>
    public IReadOnlyList<string> ApplyTo(IReadOnlyList<string> inferred)
    {
        var result = new List<string>();
        foreach (var id in Order)
            if (inferred.Contains(id) && !Hidden.Contains(id) && !result.Contains(id)) result.Add(id);
        foreach (var id in inferred)
            if (!Hidden.Contains(id) && !result.Contains(id)) result.Add(id);
        return result;
    }

    /// <summary>The override for a field, or an empty one — so callers never branch on null.</summary>
    public FieldOverride OverrideFor(string fieldId) =>
        Overrides.TryGetValue(fieldId, out var o) ? o : new FieldOverride();

    /// <summary>The delta that turns <paramref name="inferred"/> into <paramref name="desired"/>,
    /// recording only what differs: a screen dragged into exactly its inferred order produces an
    /// empty delta, and therefore keeps re-deriving.</summary>
    public static LayoutDelta Between(IReadOnlyList<string> inferred, IReadOnlyList<string> desired)
    {
        var hidden = inferred.Where(id => !desired.Contains(id)).ToList();
        var visibleInferred = inferred.Where(id => !hidden.Contains(id)).ToList();
        var order = visibleInferred.SequenceEqual(desired) ? [] : desired.ToList();
        return new LayoutDelta(order, hidden);
    }
}
