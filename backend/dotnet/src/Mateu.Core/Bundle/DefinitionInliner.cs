using System.Globalization;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core.Bundle;

/// <summary>
/// Resolves, at BUILD time, the references a shipped (specs-mode) definition may carry that the
/// browser cannot: a <c>type: Partial</c> (its file lives in <c>specs/ui/partials/</c>, which a
/// bundle does not ship) and a <c>type: ComponentRef</c> (the business component catalogue,
/// <c>components.yaml</c>). The .NET twin of Java's <c>DefinitionInliner</c>, same rules: a partial
/// of several components is SPLICED into the list holding it (a single slot gets them stacked in a
/// VerticalLayout), partials compose, a cycle or an unknown file is logged and left as it was.
/// Works on the deserialised YAML tree (maps of <c>object</c>, lists, scalars).
/// </summary>
internal sealed class DefinitionInliner(string specsDir)
{
    private const int MaxDepth = 20;
    private const string Components = "components.yaml";

    private static readonly ILogger Log = MateuLogging.For("Mateu.Bundle");

    private static readonly IDeserializer Yaml =
        new DeserializerBuilder().WithAttemptingUnquotedStringTypeDeserialization().Build();

    private Dictionary<string, object>? _components;

    /// <summary>The definition with its partials and business-component references inlined.</summary>
    public object? Inline(object? definition) => Rewrite(definition, []);

    private object? Rewrite(object? node, List<string> chain)
    {
        switch (node)
        {
            case IDictionary<object, object> map:
                if (Expand(map, chain) is { } single) return single.Count == 1 ? single[0] : Stack(single);
                return map.ToDictionary(kv => kv.Key, kv => Slot(kv.Value, chain)!);
            case string s:
                return s;
            case IEnumerable<object> list:
                var out_ = new List<object?>();
                foreach (var element in list)
                {
                    if (Expand(element, chain) is { } expanded) out_.AddRange(expanded);
                    else out_.Add(Rewrite(element, chain));
                }
                return out_;
            default:
                return node;
        }
    }

    private object? Slot(object? value, List<string> chain) =>
        value is IDictionary<object, object> && Expand(value, chain) is { } expanded
            ? expanded.Count == 1 ? expanded[0] : Stack(expanded)
            : Rewrite(value, chain);

    private List<object?>? Expand(object? node, List<string> chain)
    {
        if (node is not IDictionary<object, object> map) return null;
        var type = map.TryGetValue("type", out var t) ? t as string ?? "" : "";
        var reference = map.TryGetValue("ref", out var r) ? (r as string ?? "").Trim() : "";
        if (reference.Length == 0) return null;
        if (chain.Count >= MaxDepth)
        {
            Log.LogError("bundle: references nest deeper than {Depth} at '{Ref}'; left as it was", MaxDepth, reference);
            return null;
        }
        if (type == "ComponentRef")
        {
            if (!ComponentsByName().TryGetValue(reference, out var component))
            {
                Log.LogWarning("bundle: business component '{Ref}' is not in {File} — left as a reference", reference, Components);
                return null;
            }
            var key = "component:" + reference;
            if (chain.Contains(key))
            {
                Log.LogError("bundle: business component '{Ref}' includes itself; left as a reference", reference);
                return null;
            }
            chain.Add(key);
            try { return [Rewrite(YamlAccess.DeepCopy(component), chain)]; }
            finally { chain.RemoveAt(chain.Count - 1); }
        }
        if (type != "Partial") return null;
        if (reference.Contains('.') && !PartialRegistry.IsYamlPath(reference)) return null; // a class partial
        var relative = PartialRegistry.CandidatePaths(reference).FirstOrDefault(c => File.Exists(Path.Combine(specsDir, c)));
        if (relative is null)
        {
            Log.LogWarning("bundle: no partial '{Ref}' — left as a reference", reference);
            return null;
        }
        var partialKey = "partial:" + relative.Replace('\\', '/');
        if (chain.Contains(partialKey))
        {
            Log.LogError("bundle: partial '{Ref}' includes itself; left as it was", reference);
            return null;
        }
        object? root;
        try { root = Yaml.Read<object?>(File.ReadAllText(Path.Combine(specsDir, relative))); }
        catch (Exception e)
        {
            Log.LogWarning("bundle: could not read partial '{Ref}': {Error}", reference, e.Message);
            return null;
        }
        if (root is null) return null;
        chain.Add(partialKey);
        try
        {
            var out_ = new List<object?>();
            if (root is IDictionary<object, object> rootMap && !rootMap.ContainsKey("type")
                && rootMap.TryGetValue("content", out var content) && content is IEnumerable<object> children
                && content is not string)
            {
                foreach (var child in children)
                {
                    if (Expand(child, chain) is { } nested) out_.AddRange(nested);
                    else out_.Add(Rewrite(child, chain));
                }
            }
            else
            {
                out_.Add(Rewrite(root, chain));
            }
            return out_;
        }
        finally { chain.RemoveAt(chain.Count - 1); }
    }

    private Dictionary<string, object> ComponentsByName()
    {
        if (_components is not null) return _components;
        _components = new Dictionary<string, object>();
        var file = Path.Combine(specsDir, Components);
        if (!File.Exists(file)) return _components;
        try
        {
            var root = Yaml.Read<object?>(File.ReadAllText(file));
            var list = root is IDictionary<object, object> m && m.TryGetValue("components", out var c) ? c : root;
            if (list is not string && list is IEnumerable<object> entries)
                foreach (var entry in entries.OfType<IDictionary<object, object>>())
                    if (entry.TryGetValue("name", out var name) && name is string n && n.Length > 0
                        && entry.TryGetValue("component", out var comp) && comp is IDictionary<object, object>)
                        _components[n] = comp;
        }
        catch (Exception e)
        {
            Log.LogWarning("bundle: could not read {File}: {Error}", Components, e.Message);
        }
        return _components;
    }

    private static Dictionary<object, object> Stack(List<object?> children) =>
        new() { ["type"] = "VerticalLayout", ["content"] = children };
}

/// <summary>Deserialised YAML trees (maps of <c>object</c>, lists, typed scalars) as JSON.</summary>
internal static class YamlTree
{
    public static JsonNode? ToJson(object? node) => node switch
    {
        null => null,
        IDictionary<object, object> map => new JsonObject(map.Select(kv =>
            KeyValuePair.Create(Convert.ToString(kv.Key, CultureInfo.InvariantCulture) ?? "", ToJson(kv.Value)))),
        string s => JsonValue.Create(s),
        bool b => JsonValue.Create(b),
        int i => JsonValue.Create(i),
        long l => JsonValue.Create(l),
        double d => JsonValue.Create(d),
        float f => JsonValue.Create(f),
        decimal m => JsonValue.Create(m),
        byte or sbyte or short or ushort or uint => JsonValue.Create(Convert.ToInt64(node, CultureInfo.InvariantCulture)),
        ulong u => JsonValue.Create(u),
        IEnumerable<object> list => new JsonArray(list.Select(ToJson).ToArray()),
        _ => JsonValue.Create(Convert.ToString(node, CultureInfo.InvariantCulture)),
    };

    private static readonly string[] AccessKeys =
        [YamlAccess.AccessKey, YamlAccess.EyesOnlyKey, YamlAccess.ReadOnlyUnlessKey, YamlAccess.DisabledUnlessKey];

    /// <summary><see cref="YamlAccess.DeclaresAccess"/> over a JSON tree.</summary>
    public static bool DeclaresAccess(JsonNode? node) => node switch
    {
        JsonObject obj => AccessKeys.Any(obj.ContainsKey) || obj.Any(kv => DeclaresAccess(kv.Value)),
        JsonArray arr => arr.Any(DeclaresAccess),
        _ => false,
    };
}
