using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// The capability crud bridge (C# analogue of Java's CapabilityCrud): resolves what a routed
/// <see cref="IListing{TRow}"/> class DECLARES — the input capabilities (ISearchable,
/// IFilterable) and the interaction capabilities (INavigable, IEditable, ICreatable, IDeletable)
/// — so the engine serves ONLY the routes/buttons of the declared capabilities: rows are
/// clickable only when navigable, New appears only when creatable, selection + Delete only when
/// deletable, and an editable-without-navigable listing opens its editor in a Drawer over the
/// listing (the "editable listing" idiom). Crud&lt;T&gt; subclasses keep their own engine path
/// (they declare every capability), and a declarative Listing&lt;TFilters,TRow&gt; without
/// interaction capabilities keeps the plain read-only listing path.
/// </summary>
internal sealed class CapabilityProfile
{
    public required Type ListingType { get; init; }

    /// <summary>The closed IListing&lt;TRow&gt; interface — Search is invoked through it so
    /// explicit interface implementations work too.</summary>
    public required Type ListingInterface { get; init; }

    public required Type RowType { get; init; }
    public Type? FiltersType { get; init; }
    public Type? NavigableInterface { get; init; }
    public Type? EditableInterface { get; init; }
    public Type? CreatableInterface { get; init; }
    public Type? DeletableInterface { get; init; }
    public bool Searchable { get; init; }

    public bool CanView => NavigableInterface is not null;
    public bool CanEdit => EditableInterface is not null;
    public bool CanCreate => CreatableInterface is not null;
    public bool CanDelete => DeletableInterface is not null;

    /// <summary>Editable without navigable = the "editable listing": rows open the editor in a
    /// drawer over the listing (mirrors Java's CapabilityCrud.editInDrawer).</summary>
    public bool EditInDrawer => CanEdit && !CanView;

    public Type DetailType => NavigableInterface?.GetGenericArguments()[0] ?? RowType;
    public Type EditorType => EditableInterface?.GetGenericArguments()[0] ?? RowType;
    public Type FormType => CreatableInterface?.GetGenericArguments()[0] ?? RowType;

    public Type IdType =>
        NavigableInterface?.GetGenericArguments()[1]
        ?? EditableInterface?.GetGenericArguments()[1]
        ?? CreatableInterface?.GetGenericArguments()[1]
        ?? DeletableInterface?.GetGenericArguments()[0]
        ?? typeof(string);

    /// <summary>The profile of a capability listing, or null when the type is not one (not an
    /// IListing, a Crud&lt;T&gt; subclass, or a declarative Listing&lt;TFilters,TRow&gt; without
    /// interaction capabilities — those keep their existing paths).</summary>
    public static CapabilityProfile? Of(Type type)
    {
        if (ReflectionMapper.CrudElementType(type) is not null) return null;
        if (Closed(type, typeof(IListing<>)) is not { } listing) return null;
        var navigable = Closed(type, typeof(INavigable<,>));
        var editable = Closed(type, typeof(IEditable<,>));
        var creatable = Closed(type, typeof(ICreatable<,>));
        var deletable = Closed(type, typeof(IDeletable<>));
        if (ReflectionMapper.ListingTypes(type) is not null
            && navigable is null && editable is null && creatable is null && deletable is null)
            return null;
        return new CapabilityProfile
        {
            ListingType = type,
            ListingInterface = listing,
            RowType = listing.GetGenericArguments()[0],
            FiltersType = Closed(type, typeof(IFilterable<>))?.GetGenericArguments()[0],
            NavigableInterface = navigable,
            EditableInterface = editable,
            CreatableInterface = creatable,
            DeletableInterface = deletable,
            Searchable = typeof(Mateu.Uidl.ISearchable).IsAssignableFrom(type),
        };
    }

    private static Type? Closed(Type type, Type openGeneric) =>
        type.GetInterfaces()
            .FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == openGeneric);
}
