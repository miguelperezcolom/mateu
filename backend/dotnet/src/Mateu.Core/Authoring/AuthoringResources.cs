using System.Collections.Concurrent;
using System.Text.Json.Nodes;

namespace Mateu.Core.Authoring;

/// <summary>The authoring contract a running app serves to agents — the generated schemas, the
/// component catalogue derived from them and the agent guide. Embedded in Mateu.Core from
/// <c>backend/shared/uidl/</c> (linked, not copied), so the .NET backend serves the same bytes as the
/// Java jar, Python and the sidecar. C# twin of Java's <c>AuthoringResources</c>.</summary>
internal static class AuthoringResources
{
    /// <summary>Prefix of the embedded resources' logical names.</summary>
    public const string ResourcePrefix = "Mateu.Authoring.";

    /// <summary>One MCP resource: its URI, the file behind it and how it is described.</summary>
    public sealed record Resource(string Uri, string File, string Name, string Description, string MimeType);

    /// <summary>The resources, in the order <c>resources/list</c> answers them (the same everywhere).</summary>
    public static readonly IReadOnlyList<Resource> Resources =
    [
        new("mateu://guide", "authoring-guide.md", "Authoring guide",
            "How to write Mateu YAML definitions with these tools: the workflow, a sample page and"
            + " the rules that keep a definition valid.",
            "text/markdown"),
        new("mateu://catalog", "uidl-catalog.json", "Component catalogue",
            "Every component type with a one-line description and its main attributes"
            + " (generated from the schema).",
            "application/json"),
        new("mateu://schema/specs", "specs-schema.json", "specs/ui schema",
            "JSON Schema of every file under specs/ui: pages, app shells, mounts, routes, sources,"
            + " actions, translations, environments, field types and the project descriptor.",
            "application/schema+json"),
        new("mateu://schema/uidl", "uidl-schema.json", "Component schema",
            "JSON Schema of the component catalogue (UIDL).",
            "application/schema+json"),
    ];

    private static readonly ConcurrentDictionary<string, string> Texts = new();
    private static readonly Lazy<JsonObject> Specs = new(() => (JsonObject)JsonNode.Parse(Text("specs-schema.json"))!);
    private static readonly Lazy<JsonObject> Catalogue = new(() => (JsonObject)JsonNode.Parse(Text("uidl-catalog.json"))!);

    /// <summary>The resource of <paramref name="uri"/>, or null.</summary>
    public static Resource? ByUri(string uri) => Resources.FirstOrDefault(r => r.Uri == uri);

    /// <summary>The text of a packaged file.</summary>
    public static string Text(string file) => Texts.GetOrAdd(file, Read);

    /// <summary>The parsed <c>specs-schema.json</c> (shared: never mutate it — clone what you hand out).</summary>
    public static JsonObject SpecsSchema => Specs.Value;

    /// <summary>The parsed <c>uidl-catalog.json</c> (shared: never mutate it).</summary>
    public static JsonObject Catalog => Catalogue.Value;

    private static string Read(string file)
    {
        using var stream = typeof(AuthoringResources).Assembly.GetManifestResourceStream(ResourcePrefix + file)
                           ?? throw new InvalidOperationException(
                               "The authoring resource " + ResourcePrefix + file + " is not embedded in Mateu.Core");
        using var reader = new StreamReader(stream, System.Text.Encoding.UTF8);
        return reader.ReadToEnd();
    }
}
