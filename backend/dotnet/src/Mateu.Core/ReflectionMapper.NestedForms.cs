using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Nested data objects in a form (Java: ReflectionFormFieldMapper's nested-form branch, the @Inline
// expansion in FormLayoutBuilder, SectionFormRenderer's inline triggers, FormViewSerializer's
// flattened state and RunMethodActionRunner's nested-form-action-<field>-<method> dispatch).
//
// A property holding a plain data object (a POCO: not a basic value, enum, collection, component,
// routed view or adapted type) is a NESTED FORM: its fields render with the ids prefixed by
// "<field>-". With [Inline] they expand straight into the host section (a full-row CustomField
// holding their form layout); without it they render as a sub-form (an outlined Card holding a
// level+1 Page titled after the field). The nested object's [Toolbar]/[Button] methods dispatch
// "nested-form-action-<field>-<method>" and run ON the (hydrated) nested object.
internal sealed partial class ReflectionMapper
{
    /// <summary>The action-id prefix of a nested object's method (Java's
    /// <c>nested-form-action-</c>).</summary>
    public const string NestedFormActionPrefix = "nested-form-action-";

    /// <summary>The field-id prefix of the nested form being mapped ("" at the top level, else
    /// "supplier-", "supplier-address-"…). AsyncLocal because the mapper is shared across requests;
    /// set and restored around each nested mapping.</summary>
    private static readonly AsyncLocal<string?> FieldPrefixLocal = new();

    /// <summary>The page level of the nested sub-form being mapped (0 at the top).</summary>
    private static readonly AsyncLocal<int> NestedLevelLocal = new();

    private static string FieldPrefix => FieldPrefixLocal.Value ?? "";

    private static readonly HashSet<Assembly> MateuAssemblies =
        [typeof(ButtonAttribute).Assembly, typeof(ReflectionMapper).Assembly, typeof(ActionDto).Assembly];

    /// <summary>Whether values of <paramref name="t"/> are plain data objects that render as a
    /// nested form: a concrete class with a public parameterless constructor, outside the BCL and
    /// Mateu, that is no collection, component, delegate or routed view.</summary>
    internal static bool IsNestedFormType(Type t)
    {
        if (!t.IsClass || t.IsAbstract || t.IsArray || t == typeof(string) || t.ContainsGenericParameters) return false;
        if (typeof(System.Collections.IEnumerable).IsAssignableFrom(t)) return false;
        if (typeof(IComponent).IsAssignableFrom(t) || typeof(Delegate).IsAssignableFrom(t)) return false;
        if (MateuAssemblies.Contains(t.Assembly)) return false;
        var ns = t.Namespace ?? "";
        if (ns == "System" || ns.StartsWith("System.") || ns == "Microsoft" || ns.StartsWith("Microsoft.")) return false;
        if (t.GetCustomAttribute<UIAttribute>() is not null) return false;
        // a listing / crud is an island (or a [Subresource]), never a nested form
        if (IsOrchestratorType(t)) return false;
        return t.GetConstructor(Type.EmptyTypes) is not null;
    }

    /// <summary>A property that renders as a nested form (a data object that is no island).</summary>
    internal bool IsNestedFormProperty(PropertyInfo p) =>
        GridRowType(p) is null && !IsIslandProperty(p) && IsNestedFormType(p.PropertyType);

    /// <summary>The same, without the adapter registry (state binding, column inference).</summary>
    internal static bool IsNestedFormPropertyType(PropertyInfo p) =>
        GridRowType(p) is null && IsNestedFormType(p.PropertyType);

    /// <summary>A nested form marked [Inline]: its fields expand into the host section.</summary>
    internal static bool IsInlineNestedForm(PropertyInfo p) =>
        p.Find<InlineAttribute>() is not null && IsNestedFormPropertyType(p);

    /// <summary>The wire id of a field at the current nesting (the prefix plus its camelCase name).</summary>
    private static string PrefixedFieldId(PropertyInfo p) => FieldPrefix + Naming.CamelCase(p.Name);

    /// <summary>A <c>${state…}</c> reference to a state key: the dotted form for an identifier,
    /// the bracket form otherwise (Java's ReflectionFormFieldMapper.stateExpression).</summary>
    private static string StateExpression(string key) =>
        System.Text.RegularExpressions.Regex.IsMatch(key, "^[A-Za-z_$][A-Za-z0-9_$]*$")
            ? "${state." + key + "}"
            : "${state['" + key + "']}";

    /// <summary>Runs <paramref name="map"/> with the field prefix extended by
    /// <paramref name="p"/>'s name (and, for a sub-form, the page level raised to
    /// <paramref name="level"/>).</summary>
    private static T WithinNested<T>(PropertyInfo p, int? level, Func<T> map)
    {
        var previousPrefix = FieldPrefixLocal.Value;
        var previousLevel = NestedLevelLocal.Value;
        FieldPrefixLocal.Value = FieldPrefix + Naming.CamelCase(p.Name) + "-";
        if (level is { } l) NestedLevelLocal.Value = l;
        try { return map(); }
        finally
        {
            FieldPrefixLocal.Value = previousPrefix;
            NestedLevelLocal.Value = previousLevel;
        }
    }

    /// <summary>The nested object a property holds, or a fresh one when it holds none.</summary>
    private static object NestedValue(PropertyInfo p, object instance) =>
        p.GetValue(instance) ?? Activator.CreateInstance(p.PropertyType)!;

    /// <summary>A nested-form property as its form component: the [Inline] expansion or the
    /// sub-form card (see the file summary).</summary>
    private ClientSideComponentDto MapNestedFormField(PropertyInfo p, object instance, bool readOnly, int columns)
    {
        var value = NestedValue(p, instance);
        var nestedType = value.GetType();
        var fieldId = PrefixedFieldId(p);
        if (p.Find<InlineAttribute>() is not null)
        {
            var fields = WithinNested(p, null, () => MapFields(NestedFormProperties(nestedType, readOnly), value, readOnly, columns));
            var layout = Client(new FormLayoutMetadataDto { MaxColumns = columns }, null, FormRows(fields, columns));
            var body = Client(new VerticalLayoutMetadataDto(), null, [layout]) with { Style = "width: 100%;" };
            return Client(new CustomFieldMetadataDto("", body, columns), fieldId, []) with { Style = "width: 100%;" };
        }
        var level = NestedLevelLocal.Value + 1;
        var actionPrefix = NestedFormActionPrefix + fieldId + "-";
        var (toolbarMethods, buttonMethods) = NestedTriggerMethods(nestedType);
        var toolbar = toolbarMethods.Select(m => MapToolbarButton(m) with { ActionId = actionPrefix + Naming.CamelCase(m.Name) }).ToList();
        var buttons = buttonMethods.Select(m => MapButton(m) with { ActionId = actionPrefix + Naming.CamelCase(m.Name) }).ToList();
        var content = WithinNested(p, level, () => FormCards(nestedType, value, readOnly));
        var page = Client(new PageMetadataDto(T(p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name)), null, null,
            toolbar, buttons)
        {
            Level = level,
            Badges = Badges(nestedType, value),
        }, null, content);
        return Client(new CardMetadataDto(page), fieldId, []) with { Style = "width: 100%;" };
    }

    /// <summary>The fields a nested form renders (the same filter as a top-level form).</summary>
    private List<PropertyInfo> NestedFormProperties(Type nestedType, bool readOnly) =>
        EditableProperties(nestedType).Where(Visible)
            .Where(p => readOnly || p.Find<VersionAttribute>() is null).ToList();

    /// <summary>A nested type's [Toolbar] methods and its [Button] methods that are no toolbar
    /// ones, each offered to the caller.</summary>
    private (List<MethodInfo> Toolbar, List<MethodInfo> Buttons) NestedTriggerMethods(Type nestedType)
    {
        var methods = nestedType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => ForCurrentAudience(m) && Authorized(m.Find<EyesOnlyAttribute>())).ToList();
        return (methods.Where(m => m.Find<ToolbarAttribute>() != null).ToList(),
            methods.Where(m => m.Find<ButtonAttribute>() != null && m.Find<ToolbarAttribute>() == null).ToList());
    }

    /// <summary>A section's inline nested objects' triggers as small buttons: the [Toolbar] ones
    /// for the title row, the [Button] ones for the row under the content (Java's
    /// SectionFormRenderer inline triggers, multi-section path only).</summary>
    private (List<ComponentDto> Toolbar, List<ComponentDto> Buttons) InlineTriggers(IReadOnlyList<PropertyInfo>? props)
    {
        var toolbar = new List<ComponentDto>();
        var buttons = new List<ComponentDto>();
        foreach (var p in (props ?? []).Where(p => IsInlineNestedForm(p) && IsNestedFormProperty(p)))
        {
            var actionPrefix = NestedFormActionPrefix + PrefixedFieldId(p) + "-";
            var (toolbarMethods, buttonMethods) = NestedTriggerMethods(p.PropertyType);
            toolbar.AddRange(toolbarMethods.Select(m => TriggerButton(MapToolbarButton(m), actionPrefix + Naming.CamelCase(m.Name))));
            buttons.AddRange(buttonMethods.Select(m => TriggerButton(MapButton(m), actionPrefix + Naming.CamelCase(m.Name))));
        }
        return (toolbar, buttons);
    }

    private static ComponentDto TriggerButton(ButtonDto button, string actionId) =>
        Client(new ButtonMetadataDto(button.Label!, actionId)
        {
            Color = "normal",
            Shortcut = button.Shortcut,
            Size = "small",
            Disabled = button.Disabled,
        }, null, []);

    /// <summary>The actions of every nested-form property of <paramref name="type"/> (one level),
    /// prefixed <c>nested-form-action-&lt;field&gt;-</c>, in Java's FieldActionCollector order over
    /// the nested class: [Action] methods (not validated, with their shortcut/options), the nested
    /// class's field actions, the [Button]/[Toolbar] methods with no [Action] (validated), the
    /// [Fab]s.</summary>
    internal List<ActionDto> NestedFormActions(Type type)
    {
        var actions = new List<ActionDto>();
        void Add(ActionDto a)
        {
            if (actions.All(x => x.Id != a.Id)) actions.Add(a);
        }
        foreach (var p in EditableProperties(type).Where(p => IsNestedFormProperty(p) && Visible(p)))
        {
            var prefix = NestedFormActionPrefix + Naming.CamelCase(p.Name) + "-";
            var nestedType = p.PropertyType;
            var methods = nestedType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => !m.IsSpecialName && ForCurrentAudience(m) && Authorized(m.Find<EyesOnlyAttribute>())).ToList();
            ActionDto Of(MethodInfo m, bool validates)
            {
                var a = new ActionDto(prefix + Naming.CamelCase(m.Name), ValidationRequired: validates)
                {
                    Shortcut = m.Find<ShortcutAttribute>()?.Keys,
                };
                if (m.ReturnType == typeof(LongTaskRun)) a = a with { Sse = true };
                return m.Find<ActionOptionsAttribute>() is { } options ? ActionOptionsOf(a, options) : a;
            }
            foreach (var m in methods.Where(m => m.Find<ActionAttribute>() != null)) Add(Of(m, false));
            foreach (var a in FieldActions(nestedType)) Add(a with { Id = prefix + a.Id });
            foreach (var m in methods.Where(m => m.Find<ActionAttribute>() == null
                                                 && (m.Find<ButtonAttribute>() != null || m.Find<ToolbarAttribute>() != null)))
                Add(Of(m, true));
            foreach (var m in methods.Where(m => m.Find<FabAttribute>() != null)) Add(Of(m, false));
        }
        return actions;
    }

    /// <summary>A nested object's state: a nested map of its own field values, nulls dropped,
    /// nested objects recursively (Java's FormViewSerializer). The fragment state also carries it
    /// flattened under the prefixed ids (<see cref="NestedFormState.Flatten"/>).</summary>
    private NestedFormState NestedStateOf(object value)
    {
        var state = new NestedFormState();
        foreach (var kv in InitialDataOf(value.GetType(), value))
            if (kv.Value is not null) state[kv.Key] = kv.Value;
        return state;
    }
}

/// <summary>The state of a nested data object as it rides in initialData: a nested map. The
/// fragment state carries it again flattened, each entry under <c>&lt;field&gt;-&lt;key&gt;</c>,
/// recursively — what the nested fields bind to.</summary>
internal sealed class NestedFormState : Dictionary<string, object?>
{
    /// <summary><paramref name="state"/> plus every nested-form map flattened under its prefixed
    /// keys; the same dictionary when there is none.</summary>
    internal static IReadOnlyDictionary<string, object?> Flatten(IReadOnlyDictionary<string, object?> state)
    {
        if (!state.Values.Any(v => v is NestedFormState)) return state;
        var flat = new Dictionary<string, object?>(state);
        foreach (var (key, value) in state)
            if (value is NestedFormState nested) AddFlattened(flat, key + "-", nested);
        return flat;
    }

    private static void AddFlattened(Dictionary<string, object?> into, string prefix, NestedFormState nested)
    {
        foreach (var (key, value) in nested)
        {
            into[prefix + key] = value;
            if (value is NestedFormState deeper) AddFlattened(into, prefix + key + "-", deeper);
        }
    }
}
