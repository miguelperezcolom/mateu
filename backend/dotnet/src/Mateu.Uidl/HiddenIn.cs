namespace Mateu.Uidl;

// Per-surface visibility of a CRUD entity's property (C# analogues of Java's @HiddenInList,
// @HiddenInView, @HiddenInEditor and @HiddenInCreate). A property hidden in the editor or the
// creation form is also not TAKEN from the client on that save: it keeps its stored (or initial)
// value, so hiding a field is never a way around it.

/// <summary>The property is not a column of the crud's listing (nor of its export, nor of a grid
/// field over the type).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class HiddenInListAttribute : Attribute;

/// <summary>The property is not shown on the record's read-only view page.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class HiddenInViewAttribute : Attribute;

/// <summary>The property is not an input of the record's edit form.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class HiddenInEditorAttribute : Attribute;

/// <summary>The property is not an input of the creation form (an id assigned on save, say).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class HiddenInCreateAttribute : Attribute;

/// <summary>A listing filter shown OUTSIDE the "Filter by" panel, always visible next to the search
/// box. (C# analogue of Java's @MainFilter; the wire's FormFieldDto.mainFilter.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class MainFilterAttribute : Attribute;
