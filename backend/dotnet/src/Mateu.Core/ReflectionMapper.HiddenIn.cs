using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

// [HiddenInList] / [HiddenInView] / [HiddenInEditor] / [HiddenInCreate] (Java's FormFieldFilter
// hiddenInView/hiddenInEditor + ListingColumnBuilder/GridColumnBuilder/ExportActionRunner for the list).
internal sealed partial class ReflectionMapper
{
    /// <summary>The crud form being mapped right now ("view" | "edit" | "new"); null outside one, where
    /// none of the per-form attributes applies.</summary>
    private static readonly AsyncLocal<string?> CrudFormMode = new();

    /// <summary>Runs <paramref name="build"/> with the per-form visibility of <paramref name="mode"/>.</summary>
    private static T InCrudForm<T>(string mode, Func<T> build)
    {
        var previous = CrudFormMode.Value;
        CrudFormMode.Value = mode;
        try { return build(); }
        finally { CrudFormMode.Value = previous; }
    }

    /// <summary>Hidden on the crud form being mapped.</summary>
    internal static bool HiddenInCurrentForm(MemberInfo member) => HiddenInForm(member, CrudFormMode.Value);

    internal static bool HiddenInForm(MemberInfo member, string? mode) => mode switch
    {
        "view" => member.Find<HiddenInViewAttribute>() is not null,
        "edit" => member.Find<HiddenInEditorAttribute>() is not null,
        "new" => member.Find<HiddenInCreateAttribute>() is not null,
        _ => false,
    };

    /// <summary>Not a column of a listing, a grid field or an export.</summary>
    internal static bool HiddenInList(MemberInfo member) => member.Find<HiddenInListAttribute>() is not null;

    /// <summary>The componentState a crud save may bind: without the properties its form did not
    /// render (Java's ClientWritableFields — a hidden field keeps its stored value).</summary>
    internal static Dictionary<string, object?> WritableOnSave(Type element,
        Dictionary<string, object?> state, bool creating)
    {
        var mode = creating ? "new" : "edit";
        var hidden = EditableProperties(element).Where(p => HiddenInForm(p, mode))
            .Select(p => Naming.CamelCase(p.Name)).ToHashSet();
        return hidden.Count == 0 ? state : state.Where(e => !hidden.Contains(e.Key)).ToDictionary(e => e.Key, e => e.Value);
    }

    /// <summary>[MainFilter] filters marked on the wire (Java's PageListingBuilder: mainFilter = true).</summary>
    private static List<Mateu.Dtos.FormFieldMetadataDto> WithMainFilters(Type filters, List<Mateu.Dtos.FormFieldMetadataDto> fields)
    {
        var main = EditableProperties(filters).Where(p => p.Find<MainFilterAttribute>() is not null)
            .Select(p => Naming.CamelCase(p.Name)).ToHashSet();
        return main.Count == 0 ? fields : fields.Select(f => main.Contains(f.FieldId) ? f with { MainFilter = true } : f).ToList();
    }
}
