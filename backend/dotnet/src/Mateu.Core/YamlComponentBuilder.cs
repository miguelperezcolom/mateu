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
public static class YamlComponentBuilder
{
    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    public static IComponent? Parse(string yaml)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return null;
        object? root;
        try { root = Yaml.Deserialize<object>(yaml); }
        catch { return null; }
        // Page envelope: render the layout; a bare component tree renders as-is.
        if (root is IDictionary<object, object> map && map.TryGetValue("layout", out var layout))
            return Build(layout);
        return Build(root);
    }

    /// <summary>
    /// Parse a page spec (a file under specs/ui): the declared ModelView class name (or null for a
    /// bare, unbound layout) plus the layout component. Envelope-aware — a `layout:` key holds the
    /// tree and a `modelView:` key names the logic class the tooling binds it to.
    /// </summary>
    public static (string? ModelView, IComponent? Layout) ParseSpec(string yaml)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return (null, null);
        object? root;
        try { root = Yaml.Deserialize<object>(yaml); }
        catch { return (null, null); }
        if (root is not IDictionary<object, object> map) return (null, Build(root));
        var modelView = map.TryGetValue("modelView", out var mv) ? mv?.ToString() : null;
        var layoutNode = map.TryGetValue("layout", out var layout) ? layout : root;
        return (modelView, Build(layoutNode));
    }

    private static IComponent? Build(object? node)
    {
        if (node is not IDictionary<object, object> map) return null;
        return Str(map, "type") switch
        {
            "VerticalLayout" => new VerticalLayout { Spacing = Bool(map, "spacing"), Content = Children(map) },
            "HorizontalLayout" => new HorizontalLayout { Spacing = Bool(map, "spacing", true), Content = Children(map) },
            // .NET has no standalone FormLayout fluent — a stacked VerticalLayout is a faithful preview.
            "FormLayout" => new VerticalLayout { Content = Children(map) },
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

    private static IReadOnlyList<IComponent> Children(IDictionary<object, object> map)
    {
        if (!map.TryGetValue("content", out var content) || content is not IEnumerable<object> seq)
            return [];
        return seq.Select(Build).Where(c => c is not null).Cast<IComponent>().ToList();
    }

    private static string? Str(IDictionary<object, object> map, string key)
        => map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static bool Bool(IDictionary<object, object> map, string key, bool def = false)
    {
        var s = Str(map, key);
        return s is null ? def : s.Equals("true", StringComparison.OrdinalIgnoreCase);
    }
}
