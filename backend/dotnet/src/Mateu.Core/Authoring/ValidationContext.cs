namespace Mateu.Core.Authoring;

/// <summary>What the app around a definition knows, for the semantic checks of
/// <see cref="UidlValidator"/>: which names resolve. Each predicate may be null — "unknown here" —
/// and its check is then skipped (an agent drafting a screen with no app behind it is not told every
/// source is missing). A null <see cref="Action"/> counts as an empty action catalogue. C# twin of
/// Java's <c>ValidationContext</c>.</summary>
/// <param name="Source">whether a <c>sources.yaml</c> entry of that name exists</param>
/// <param name="Partial">whether a <c>type: Partial</c> <c>ref:</c> resolves</param>
/// <param name="Component">whether a <c>type: ComponentRef</c> <c>ref:</c> is in <c>components.yaml</c></param>
/// <param name="Action">whether an action id is in the app's action catalogue</param>
/// <param name="FieldType">whether a <c>fieldType:</c> is in <c>types.yaml</c></param>
internal sealed record ValidationContext(
    Func<string, bool>? Source,
    Func<string, bool>? Partial,
    Func<string, bool>? Component,
    Func<string, bool>? Action,
    Func<string, bool>? FieldType)
{
    /// <summary>Nothing known: only the structural checks and the page's own declared actions.</summary>
    public static ValidationContext None { get; } = new(null, null, null, null, null);

    /// <summary>A context over fixed name sets (tests, the conformance corpus); a null set = unknown.</summary>
    public static ValidationContext Of(
        IEnumerable<string>? sources, IEnumerable<string>? partials, IEnumerable<string>? components,
        IEnumerable<string>? actions, IEnumerable<string>? fieldTypes) =>
        new(In(sources), In(partials), In(components), In(actions), In(fieldTypes));

    private static Func<string, bool>? In(IEnumerable<string>? names)
    {
        if (names is null) return null;
        var set = new HashSet<string>(names, StringComparer.Ordinal);
        return set.Contains;
    }
}
