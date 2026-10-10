using Microsoft.Extensions.Logging;
using Mateu.Uidl;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// Builds a fluent component tree from YAML page text — the visual-builder live preview (mirrors
/// Java's YamlUidlLoader.parseText). The YAML uses a `type` discriminator; this dispatches on it and
/// reads the YAML keys into the fluent components (handling the name differences: a FormField's
/// `id` → FieldId, a Text's `text` → Content). Envelope-aware: unwraps a `layout:` key. The tree is
/// then mapped to the wire by the normal <see cref="ComponentMapper"/>.
/// </summary>
/// <remarks>
/// A <c>type: Partial</c> node is resolved here, against a <see cref="PartialRegistry"/>, and never
/// reaches the built tree — so nothing downstream, and no renderer, has to know partials exist.
/// </remarks>
public static class YamlComponentBuilder
{
    /// <summary>A partial chain longer than this is a bug, not a design.</summary>
    private const int MaxDepth = 20;

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    /// <summary>Raw YAML → nodes, for callers that splice before building (the partial registry).</summary>
    public static object? Deserialize(string yaml)
    {
        try { return Yaml.Deserialize<object>(yaml); }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Yaml").LogWarning("Invalid YAML ignored: {Error}", e.Message);
            return null;
        }
    }

    /// <summary>An already-deserialised YAML node as a component (components.yaml entries).</summary>
    internal static IComponent? FromNode(object? node, FieldTypeRegistry? types = null) =>
        Single(node, new Ctx(PartialRegistry.Default, types ?? FieldTypeRegistry.None), []);

    public static IComponent? Parse(string yaml, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return null;
        var root = Deserialize(yaml);
        if (root is null) return null;
        // Page envelope: render the layout; a bare component tree renders as-is.
        var node = root is IDictionary<object, object> map && map.TryGetValue("layout", out var layout)
            ? layout
            : root;
        return Single(node, new Ctx(partials ?? PartialRegistry.Default, types ?? FieldTypeRegistry.None), []);
    }

    /// <summary>
    /// Parse a page spec (a file under specs/ui): the declared ModelView class name (or null for a
    /// bare, unbound layout) plus the layout component. Envelope-aware — a `layout:` key holds the
    /// tree and a `modelView:` key names the logic class the tooling binds it to.
    /// </summary>
    public static (string? ModelView, IComponent? Layout) ParseSpec(
        string yaml, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        var (modelView, layout, _) = ParsePage(yaml, partials, types);
        return (modelView, layout);
    }

    /// <summary>
    /// Parse a page spec with its <c>layoutDelta:</c>: the ModelView class name (the canonical
    /// <c>viewModel:</c> or the legacy <c>modelView:</c> key), the explicit layout (a SNAPSHOT —
    /// null for a delta-only page) and the delta (empty when none; mirrors Java's
    /// YamlUidlLoader.deltaOf).
    /// </summary>
    public static (string? ModelView, IComponent? Layout, LayoutDelta Delta) ParsePage(
        string yaml, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return (null, null, LayoutDelta.Empty);
        return ParsePageNode(Deserialize(yaml), partials, types);
    }

    /// <summary><see cref="ParsePage(string, PartialRegistry?, FieldTypeRegistry?)"/> over an already-deserialised tree —
    /// what a per-request personalised spec (access keys applied, <c>${i18n.…}</c> resolved) is
    /// re-built from.</summary>
    public static (string? ModelView, IComponent? Layout, LayoutDelta Delta) ParsePageNode(
        object? root, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        if (root is null) return (null, null, LayoutDelta.Empty);
        var registry = new Ctx(partials ?? PartialRegistry.Default, types ?? FieldTypeRegistry.None);
        if (root is not IDictionary<object, object> map) return (null, Single(root, registry, []), LayoutDelta.Empty);
        var modelView = map.TryGetValue("modelView", out var mv) ? mv?.ToString()
            : map.TryGetValue("viewModel", out var vm) ? vm?.ToString() : null;
        var delta = DeltaOf(map);
        // A page that carries a `layoutDelta:` and no `layout:` has NO explicit layout on purpose —
        // that is the whole point of a delta: the view model's INFERRED layout renders and the delta
        // is re-applied on top. Falling back to "the whole document is the tree" here would render
        // the envelope itself as a component.
        if (!map.ContainsKey("layout") && map.ContainsKey("layoutDelta"))
            return (modelView, null, delta);
        var layoutNode = map.TryGetValue("layout", out var layout) ? layout : root;
        return (modelView, Single(layoutNode, registry, []), delta);
    }

    /// <summary>The <c>layoutDelta:</c> of a page — order, hidden, per-field overrides
    /// (label/colspan/section) — or <see cref="LayoutDelta.Empty"/>.</summary>
    private static LayoutDelta DeltaOf(IDictionary<object, object> root)
    {
        if (!root.TryGetValue("layoutDelta", out var node) || node is not IDictionary<object, object> delta)
            return LayoutDelta.Empty;
        static List<string> Strings(IDictionary<object, object> map, string key) =>
            map.TryGetValue(key, out var v) && v is IEnumerable<object> list
                ? list.Where(i => i is not null).Select(i => i.ToString()!).ToList()
                : [];
        var overrides = new Dictionary<string, LayoutDelta.FieldOverride>();
        if (delta.TryGetValue("overrides", out var o) && o is IDictionary<object, object> map)
            foreach (var (key, value) in map)
            {
                if (key?.ToString() is not { } fieldId) continue;
                var spec = value as IDictionary<object, object>;
                string? Str(string k) => spec is not null && spec.TryGetValue(k, out var s) ? s?.ToString() : null;
                overrides[fieldId] = new LayoutDelta.FieldOverride(
                    Str("label"),
                    int.TryParse(Str("colspan"), out var colspan) ? colspan : null,
                    Str("section"));
            }
        return new LayoutDelta(Strings(delta, "order"), Strings(delta, "hidden"), overrides);
    }

    /// <summary>What a node becomes in a slot that holds exactly one component.</summary>
    /// <summary>What a build carries down the tree: the partials to splice and the field types to
    /// resolve (a <c>fieldType:</c> reference is resolved on each node before it is built, partial
    /// nodes included).</summary>
    private sealed record Ctx(PartialRegistry Partials, FieldTypeRegistry Types);

    private static IComponent? Single(object? node, Ctx partials, List<string> chain)
    {
        var expanded = InList(node, partials, chain);
        return expanded.Count switch
        {
            0 => null,
            1 => expanded[0],
            // Nowhere to splice into: stacking beats dropping all but the first.
            _ => new VerticalLayout { Content = expanded },
        };
    }

    /// <summary>What a node becomes in a content list — where a partial may contribute several.</summary>
    private static List<IComponent> InList(object? node, Ctx partials, List<string> chain)
    {
        if (node is IDictionary<object, object> map && Str(map, "type") == "Partial")
        {
            var reference = Str(map, "ref") ?? "";
            if (chain.Contains(reference) || chain.Count >= MaxDepth) return [];
            chain.Add(reference);
            try
            {
                return partials.Partials.Resolve(reference)
                    .SelectMany(child => InList(child, partials, chain))
                    .ToList();
            }
            finally
            {
                chain.RemoveAt(chain.Count - 1);
            }
        }
        var built = Build(node, partials, chain);
        return built is null ? [] : [built];
    }

    private static IComponent? Build(object? node, Ctx partials, List<string> chain)
    {
        if (node is not IDictionary<object, object> declared) return null;
        var map = partials.Types.Resolve(declared);
        return Str(map, "type") switch
        {
            "VerticalLayout" => new VerticalLayout { Spacing = Bool(map, "spacing"), Content = Children(map, partials, chain) },
            "HorizontalLayout" => new HorizontalLayout { Spacing = Bool(map, "spacing", true), Content = Children(map, partials, chain) },
            // .NET has no standalone FormLayout fluent — a stacked VerticalLayout is a faithful preview.
            "FormLayout" => new VerticalLayout { Content = Children(map, partials, chain) },
            "FormField" => new FormField
            {
                FieldId = Str(map, "id") ?? "",
                DataType = Str(map, "dataType") ?? "string",
                Label = Str(map, "label"),
                Stereotype = Str(map, "stereotype") ?? "regular",
                Required = Bool(map, "required"),
                ReadOnly = Bool(map, "readOnly"),
                Options = map.TryGetValue("options", out var o) && o is IEnumerable<object> options
                    ? options.OfType<IDictionary<object, object>>()
                        .Select(opt => new Option(Str(opt, "value") ?? "", Str(opt, "label") ?? Str(opt, "value") ?? ""))
                        .ToList()
                    : [],
                Style = Str(map, "style"),
                CssClasses = Str(map, "cssClasses"),
            },
            "Button" => new Button(Str(map, "label") ?? "", Str(map, "actionId") ?? "")
            {
                Primary = Str(map, "buttonStyle") == "primary",
                Disabled = Bool(map, "disabled"),
            },
            "Text" => new Text(Str(map, "text") ?? ""),
            // A reference to a named business component (components.yaml / [BusinessComponent]).
            "ComponentRef" => new ComponentRef(Str(map, "ref") ?? ""),
            var other => new Text($"Unsupported component: {other}"),
        };
    }

    private static IReadOnlyList<IComponent> Children(
        IDictionary<object, object> map, Ctx partials, List<string> chain)
    {
        if (!map.TryGetValue("content", out var content) || content is not IEnumerable<object> seq)
            return [];
        // SelectMany, not Select: a partial standing for several components splices into the
        // parent's content rather than nesting, or a form grid would put them all in one cell.
        return seq.SelectMany(child => InList(child, partials, chain)).ToList();
    }

    private static string? Str(IDictionary<object, object> map, string key)
        => map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static bool Bool(IDictionary<object, object> map, string key, bool def = false)
    {
        var s = Str(map, key);
        return s is null ? def : s.Equals("true", StringComparison.OrdinalIgnoreCase);
    }
}
