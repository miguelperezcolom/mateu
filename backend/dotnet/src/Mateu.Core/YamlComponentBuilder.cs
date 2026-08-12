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
    internal static object? Deserialize(string yaml)
    {
        try { return Yaml.Deserialize<object>(yaml); }
        catch { return null; }
    }

    public static IComponent? Parse(string yaml, PartialRegistry? partials = null)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return null;
        var root = Deserialize(yaml);
        if (root is null) return null;
        // Page envelope: render the layout; a bare component tree renders as-is.
        var node = root is IDictionary<object, object> map && map.TryGetValue("layout", out var layout)
            ? layout
            : root;
        return Single(node, partials ?? PartialRegistry.Default, []);
    }

    /// <summary>
    /// Parse a page spec (a file under specs/ui): the declared ModelView class name (or null for a
    /// bare, unbound layout) plus the layout component. Envelope-aware — a `layout:` key holds the
    /// tree and a `modelView:` key names the logic class the tooling binds it to.
    /// </summary>
    public static (string? ModelView, IComponent? Layout) ParseSpec(string yaml, PartialRegistry? partials = null)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return (null, null);
        var root = Deserialize(yaml);
        if (root is null) return (null, null);
        var registry = partials ?? PartialRegistry.Default;
        if (root is not IDictionary<object, object> map) return (null, Single(root, registry, []));
        var modelView = map.TryGetValue("modelView", out var mv) ? mv?.ToString() : null;
        var layoutNode = map.TryGetValue("layout", out var layout) ? layout : root;
        return (modelView, Single(layoutNode, registry, []));
    }

    /// <summary>What a node becomes in a slot that holds exactly one component.</summary>
    private static IComponent? Single(object? node, PartialRegistry partials, List<string> chain)
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
    private static List<IComponent> InList(object? node, PartialRegistry partials, List<string> chain)
    {
        if (node is IDictionary<object, object> map && Str(map, "type") == "Partial")
        {
            var reference = Str(map, "ref") ?? "";
            if (chain.Contains(reference) || chain.Count >= MaxDepth) return [];
            chain.Add(reference);
            try
            {
                return partials.Resolve(reference)
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

    private static IComponent? Build(object? node, PartialRegistry partials, List<string> chain)
    {
        if (node is not IDictionary<object, object> map) return null;
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
            },
            "Button" => new Button(Str(map, "label") ?? "", Str(map, "actionId") ?? "")
            {
                Primary = Str(map, "buttonStyle") == "primary",
            },
            "Text" => new Text(Str(map, "text") ?? ""),
            var other => new Text($"Unsupported component: {other}"),
        };
    }

    private static IReadOnlyList<IComponent> Children(
        IDictionary<object, object> map, PartialRegistry partials, List<string> chain)
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
