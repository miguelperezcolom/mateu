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

    /// <summary>An [EditableOnlyWhenCreating] property outside a creation form: read-only (Java's
    /// PageFormBuilder: <c>!forCreationForm &amp;&amp; EditableOnlyWhenCreating</c>).</summary>
    internal static bool LockedOutsideCreation(MemberInfo member) =>
        member.Find<EditableOnlyWhenCreatingAttribute>() is not null && CrudFormMode.Value != "new";

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
    /// render or rendered read-only ([ReadOnly] on the property or the record class), which keep the
    /// server's value (Java's ClientWritableFields). The [Version] stays: the save compares it.</summary>
    internal static Dictionary<string, object?> WritableOnSave(Type element,
        Dictionary<string, object?> state, bool creating)
    {
        var mode = creating ? "new" : "edit";
        var readOnlyRecord = element.Find<ReadOnlyAttribute>() is not null;
        var serverOwned = EditableProperties(element)
            .Where(p => HiddenInForm(p, mode)
                        || ((readOnlyRecord || p.Find<ReadOnlyAttribute>() is not null) && p.Find<VersionAttribute>() is null)
                        // an edit keeps the stored generated value and create-only field; a create
                        // keeps the client's generated value — the server generated it for the very
                        // form being saved (Java's ClientWritableFields)
                        || (!creating && (p.Find<GeneratedValueAttribute>() is not null
                                          || p.Find<EditableOnlyWhenCreatingAttribute>() is not null)))
            .Select(p => Naming.CamelCase(p.Name)).ToHashSet();
        // a nested record also arrives flattened, as <field>-<key>
        return serverOwned.Count == 0
            ? state
            : state.Where(e => !serverOwned.Contains(e.Key.Split('-', 2)[0])).ToDictionary(e => e.Key, e => e.Value);
    }

    /// <summary>[MainFilter] filters marked on the wire (Java's PageListingBuilder: mainFilter = true).</summary>
    private static List<Mateu.Dtos.FormFieldMetadataDto> WithMainFilters(Type filters, List<Mateu.Dtos.FormFieldMetadataDto> fields)
    {
        var main = EditableProperties(filters).Where(p => p.Find<MainFilterAttribute>() is not null)
            .Select(p => Naming.CamelCase(p.Name)).ToHashSet();
        return main.Count == 0 ? fields : fields.Select(f => main.Contains(f.FieldId) ? f with { MainFilter = true } : f).ToList();
    }
}
