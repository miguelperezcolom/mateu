using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

/// <summary>
/// The <c>actions:</c> a definition declares beside its <c>layout:</c> — the write half of the YAML
/// DSL (Java's <c>YamlUidlLoader.actionsOf</c> read into <c>SeededYamlPage</c>). A definition-only
/// page (a route with a layout and no view model) has no class to declare an action on, so its
/// definition does: each entry is read into the wire action as written (Java deserialises the whole
/// fluent <c>Action</c> record), its <c>steps</c> lowered to commands and its <c>restAction</c>
/// carrying the call the CLIENT makes — or, when its source is proxied, the one the server makes
/// through <c>__restfetch__</c> from its own copy of the definition (the only channel that injects
/// <c>${secret.X}</c>).
/// </summary>
internal static class YamlDeclaredActions
{
    /// <summary>One declared action: what travels, plus the request the server keeps for the proxy
    /// leg (its headers and body never travel when proxied).</summary>
    internal sealed record Declared(ActionDto Dto, RestDataSourceDto? Source);

    /// <summary>The <c>actions:</c> of a definition (its root, beside <c>layout:</c> or the root
    /// component's own keys), in declaration order. An entry with no id is dropped with a warning:
    /// nothing could ever name it.</summary>
    internal static IReadOnlyList<Declared> Of(object? root)
    {
        if (root is not IDictionary<object, object> map || !map.TryGetValue("actions", out var nodes)
            || nodes is not IEnumerable<object> list)
            return [];
        var declared = new List<Declared>();
        foreach (var node in list)
        {
            if (node is not IDictionary<object, object> action) continue;
            var id = Str(action, "id")?.Trim();
            if (string.IsNullOrEmpty(id))
            {
                MateuLogging.For("Mateu.Yaml").LogWarning("Ignoring an action with no id in a YAML definition");
                continue;
            }
            try
            {
                declared.Add(Read(id, action));
            }
            catch (Exception e)
            {
                // One malformed action must not cost the page (Java's actionsOf): the rest still
                // render, and the id that did not parse has nothing behind it — said out loud.
                MateuLogging.For("Mateu.Yaml").LogWarning("Ignoring an unparseable action '{Id}' in a YAML definition: {Error}",
                    id, e.Message);
            }
        }
        return declared;
    }

    private static Declared Read(string id, IDictionary<object, object> map)
    {
        var rest = map.TryGetValue("restAction", out var r) && r is IDictionary<object, object> rm ? rm : null;
        var source = rest is not null && rest.TryGetValue("source", out var s) ? SourceOf(s) : null;
        var steps = ActionRegistry.StepsOf(map.TryGetValue("steps", out var st) ? st : null);
        var dto = new ActionDto(id,
            ValidationRequired: Bool(map, "validationRequired"),
            ConfirmationRequired: Bool(map, "confirmationRequired"),
            RowsSelectedRequired: Bool(map, "rowsSelectedRequired"),
            Bubble: Bool(map, "bubble"))
        {
            Background = Bool(map, "background"),
            Sse = Bool(map, "sse"),
            Idempotent = Bool(map, "idempotent"),
            TimeoutMillis = int.TryParse(Str(map, "timeoutMillis"), out var t) ? t : 0,
            Shortcut = Blank(Str(map, "shortcut")),
            FieldsToValidate = Blank(Str(map, "fieldsToValidate")),
            Href = Blank(Str(map, "href")),
            Js = Blank(Str(map, "js")),
            ConfirmationTexts = map.TryGetValue("confirmationTexts", out var ct) && ct is IDictionary<object, object> c
                ? new ConfirmationTextsDto(Str(c, "title"), Str(c, "message"), Str(c, "confirmationText"), Str(c, "denialText"))
                : null,
            CustomEvent = map.TryGetValue("customEvent", out var ce) && ce is IDictionary<object, object> e
                ? new CustomEventDto(Str(e, "eventName") ?? "", e.TryGetValue("detail", out var d) ? d : null)
                : null,
            RestAction = rest is null
                ? null
                : new RestActionDto(source ?? new RestDataSourceDto(""), Str(rest, "successMessage"), Str(rest, "resultPath"))
                {
                    SuccessRoute = Blank(Str(rest, "successRoute")),
                    ForEachSelectedRow = Bool(rest, "forEachSelectedRow"),
                },
            Commands = steps.Count == 0 ? null : steps.Select(ActionRegistry.Lower).ToList(),
        };
        return new Declared(dto, source);
    }

    /// <summary>A <c>source:</c> as DECLARED — only the keys written (a bare string is the ref
    /// shorthand): what travels is the surface as authored, as Java's record deserialisation keeps
    /// it; the catalogue entry it names is resolved by the server only for its own proxy leg.</summary>
    internal static RestDataSourceDto? SourceOf(object? node) => node switch
    {
        string name when !string.IsNullOrWhiteSpace(name) => RestDataSourceDto.FromRef(name.Trim()),
        IDictionary<object, object> m => new RestDataSourceDto(Str(m, "url") ?? "")
        {
            Ref = Blank(Str(m, "ref")?.Trim()),
            Method = Blank(Str(m, "method")),
            Headers = m.TryGetValue("headers", out var h) && h is IDictionary<object, object> hm
                ? hm.ToDictionary(kv => kv.Key.ToString()!, kv => kv.Value?.ToString() ?? "")
                : null,
            Body = Blank(Str(m, "body")),
            ItemsPath = Blank(Str(m, "itemsPath")),
            ValuePath = Blank(Str(m, "valuePath")),
            LabelPath = Blank(Str(m, "labelPath")),
            Proxy = Bool(m, "proxy"),
            Sample = m.TryGetValue("sample", out var sample) ? sample : null,
        },
        _ => null,
    };

    /// <summary>Whether any declared action's call is made by the server (its resolved source is
    /// proxied): the page then answers <c>__restfetch__</c>, and advertises it like Java's
    /// <c>RestSourceSupplier</c> pages do.</summary>
    internal static bool ProxiesAny(IEnumerable<Declared> declared) =>
        declared.Any(a => a.Source is not null && MateuCatalogs.Resolved(a.Source) is { Proxy: true });

    /// <summary>One source a definition-only page declares: its kind on the wire (<c>action</c>,
    /// <c>options</c>, <c>rows</c>), the id the browser names it by and the source as the ENDPOINT
    /// declares it (resolved against the catalogue).</summary>
    internal sealed record DeclaredSource(RestSourceKind Kind, string Id, RestDataSourceDto Source);

    /// <summary>Every source the page declares (Java's <c>SeededYamlPage.declaredRestSources</c>): its
    /// actions' calls, and — walking the layout — a select's <c>optionsSource</c> (by the field's id),
    /// a listing's <c>rowsSource</c> (by its id, else <c>crud</c>) and a live kanban's (else
    /// <c>kanban</c>). Without these a PROXIED listing or select on a classless page had nobody to
    /// fetch it: the server never advertised <c>__restfetch__</c> and the listing stayed empty.</summary>
    internal static IReadOnlyList<DeclaredSource> SourcesOf(IEnumerable<Declared> actions, IComponent? layout)
    {
        var sources = new List<DeclaredSource>();
        foreach (var action in actions)
            if (action.Source is not null && MateuCatalogs.Resolved(action.Source) is { } resolved)
                sources.Add(new DeclaredSource(RestSourceKind.Action, action.Dto.Id, resolved));
        CollectSources(layout, sources, new HashSet<object>(ReferenceEqualityComparer.Instance));
        return sources;
    }

    private static void CollectSources(object? node, List<DeclaredSource> into, HashSet<object> seen)
    {
        if (node is null or string || node.GetType().IsValueType || !seen.Add(node)) return;
        void Add(RestSourceKind kind, string id, RestDataSource source)
        {
            if (MateuCatalogs.Resolved(MateuCatalogs.ToDto(source)) is { } resolved)
                into.Add(new DeclaredSource(kind, id, resolved));
        }
        switch (node)
        {
            case FormField { OptionsSource: { } options } field when !string.IsNullOrEmpty(field.FieldId):
                Add(RestSourceKind.Options, field.FieldId, options);
                break;
            case ListingComponent { RowsSource: { } rows } listing:
                Add(RestSourceKind.Rows, listing.Id ?? "crud", rows); // the listing mapper's default id
                break;
            case Kanban { RowsSource: { } cards } kanban:
                Add(RestSourceKind.Rows, kanban.Id ?? "kanban", cards);
                break;
        }
        if (node is System.Collections.IEnumerable items)
        {
            foreach (var item in items) CollectSources(item, into, seen);
            return;
        }
        if (node is not IComponent && node.GetType().Namespace != typeof(IComponent).Namespace) return;
        foreach (var property in node.GetType().GetProperties())
        {
            if (property.GetIndexParameters().Length > 0 || property.Name == "EqualityContract") continue;
            var type = property.PropertyType;
            if (type == typeof(string)
                || (!typeof(IComponent).IsAssignableFrom(type) && !typeof(System.Collections.IEnumerable).IsAssignableFrom(type)
                    && type.Namespace != typeof(IComponent).Namespace))
                continue;
            CollectSources(property.GetValue(node), into, seen);
        }
    }

    /// <summary>The source a <c>__restfetch__</c> for <paramref name="kind"/>/<paramref name="id"/>
    /// names: the one declared with that id first; rows (one per page) fall back to the first of
    /// their kind (Java's RestSourceResolver over a RestSourceSupplier) — never a client url.</summary>
    internal static RestDataSourceDto? SourceFor(IReadOnlyList<DeclaredSource> sources, string? kind, string? id)
    {
        if (RestSourceKinds.FromWire(kind) is not { } wanted) return null;
        var ofKind = sources.Where(s => s.Kind == wanted).ToList();
        return (ofKind.FirstOrDefault(s => s.Id == (id ?? ""))
                ?? ofKind.FirstOrDefault(_ => wanted is RestSourceKind.Rows or RestSourceKind.Data))?.Source;
    }

    /// <summary>The checks the browser runs before an action marked <c>validationRequired</c>: one per
    /// <c>required: true</c> field of the definition, with the condition and message a Java form's
    /// <c>@NotEmpty</c> gets (Java's <c>SeededYamlPage.validations</c>) — a classless page had none, so
    /// its required fields only wore the required dot.</summary>
    internal static List<ValidationDto> Validations(IComponent? layout)
    {
        var validations = new List<ValidationDto>();
        Collect(layout, validations, new HashSet<object>(ReferenceEqualityComparer.Instance));
        return validations;
    }

    private static void Collect(object? node, List<ValidationDto> into, HashSet<object> seen)
    {
        if (node is null or string || node.GetType().IsValueType || !seen.Add(node)) return;
        if (node is FormField field)
        {
            if (field is { Required: true, ReadOnly: false } && !string.IsNullOrWhiteSpace(field.FieldId))
                into.Add(new ValidationDto(ReflectionMapper.RequiredCondition($"state['{field.FieldId}']"),
                    field.FieldId, "Cannot be empty"));
            return;
        }
        if (node is System.Collections.IEnumerable items)
        {
            foreach (var item in items) Collect(item, into, seen);
            return;
        }
        if (node is not IComponent && node.GetType().Namespace != typeof(IComponent).Namespace) return;
        foreach (var property in node.GetType().GetProperties())
        {
            if (property.GetIndexParameters().Length > 0 || property.Name == "EqualityContract") continue;
            var type = property.PropertyType;
            if (!typeof(IComponent).IsAssignableFrom(type) && !typeof(System.Collections.IEnumerable).IsAssignableFrom(type)
                && type.Namespace != typeof(IComponent).Namespace)
                continue;
            if (type == typeof(string)) continue;
            Collect(property.GetValue(node), into, seen);
        }
    }

    /// <summary>Whether the page asks before it is left with unsaved changes: a <c>type: Form</c>
    /// definition declaring <c>confirmOnNavigationIfDirty: true</c> (Java's
    /// <c>SeededYamlPage.confirmOnNavigationIfDirty</c> reads the Form's flag).</summary>
    internal static bool ConfirmsOnNavigationIfDirty(object? root)
    {
        if (root is not IDictionary<object, object> map) return false;
        var page = map.TryGetValue("layout", out var layout) && layout is IDictionary<object, object> l ? l : map;
        return Str(page, "type") == "Form" && Bool(page, "confirmOnNavigationIfDirty");
    }

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static string? Blank(string? s) => string.IsNullOrWhiteSpace(s) ? null : s;

    private static bool Bool(IDictionary<object, object> map, string key) =>
        bool.TryParse(Str(map, key), out var b) && b;
}
