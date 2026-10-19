using System.Text.Json.Nodes;
using Mateu.Uidl;

namespace Mateu.Core.Authoring;

/// <summary>The agent-sized views of the schema behind <c>mateu_list_components</c> and
/// <c>mateu_get_component_schema</c>. Normative like <see cref="UidlValidator"/> (same output in
/// Java and Python, pinned by <c>conformance/mcp/authoring.json</c>). C# twin of Java's
/// <c>ComponentSchemas</c>.</summary>
internal static class ComponentSchemas
{
    private const string DefsPrefix = "#/$defs/";

    /// <summary>The catalogue's components whose type or description contains <paramref name="query"/>
    /// (ignoring case; all of them for a blank query): <c>{components: [{type, description,
    /// attributes: [name…]}], count}</c>, in catalogue order.</summary>
    public static JsonObject List(string? query)
    {
        var needle = (query ?? "").Trim().ToLowerInvariant();
        var components = new JsonArray();
        foreach (var c in AuthoringResources.Catalog["components"] as JsonArray ?? [])
        {
            var type = Text(c?["type"]);
            var description = Text(c?["description"]);
            if (needle.Length > 0
                && !type.ToLowerInvariant().Contains(needle, StringComparison.Ordinal)
                && !description.ToLowerInvariant().Contains(needle, StringComparison.Ordinal))
                continue;
            var attributes = new JsonArray();
            foreach (var a in c?["attributes"] as JsonArray ?? []) attributes.Add(Text(a?["name"]));
            components.Add(new JsonObject { ["type"] = type, ["description"] = description, ["attributes"] = attributes });
        }
        return new JsonObject { ["components"] = components, ["count"] = components.Count };
    }

    /// <summary>The <c>$def</c> of <paramref name="type"/> with every definition it references,
    /// transitively — except that a polymorphic family (a def with <c>oneOf</c>) is included and not
    /// walked into: <c>{type, schema, definitions}</c>, the definitions sorted by name (ordinal).</summary>
    /// <exception cref="UserFacingException">there is no such def</exception>
    public static JsonObject SchemaOf(string type)
    {
        var defs = AuthoringResources.SpecsSchema["$defs"] as JsonObject ?? new JsonObject();
        if (defs[type] is not JsonObject def)
        {
            var suggestion = UidlValidator.Suggest(type, defs.Select(d => d.Key).ToList());
            throw new UserFacingException(
                "Unknown type " + UidlValidator.Quote(type) + "."
                + (suggestion is not null ? " Did you mean " + UidlValidator.Quote(suggestion) + "?" : "")
                + " See mateu_list_components.");
        }
        var included = new SortedSet<string>(StringComparer.Ordinal);
        var pending = new Queue<string>();
        if (!def.ContainsKey("oneOf")) Refs(def, pending);
        while (pending.Count > 0)
        {
            var name = pending.Dequeue();
            if (name == type || !included.Add(name)) continue;
            if (defs[name] is JsonObject referenced && !referenced.ContainsKey("oneOf")) Refs(referenced, pending);
        }
        var definitions = new JsonObject();
        foreach (var name in included) definitions[name] = defs[name]?.DeepClone();
        return new JsonObject { ["type"] = type, ["schema"] = def.DeepClone(), ["definitions"] = definitions };
    }

    private static void Refs(JsonNode? node, Queue<string> into)
    {
        switch (node)
        {
            case JsonObject obj:
                if (obj["$ref"] is JsonValue r && r.TryGetValue<string>(out var reference)
                    && reference.StartsWith(DefsPrefix, StringComparison.Ordinal))
                    into.Enqueue(reference[DefsPrefix.Length..]);
                foreach (var (_, child) in obj) Refs(child, into);
                break;
            case JsonArray array:
                foreach (var child in array) Refs(child, into);
                break;
        }
    }

    private static string Text(JsonNode? node) =>
        node is JsonValue v && v.TryGetValue<string>(out var s) ? s : node?.ToJsonString() ?? "";
}
