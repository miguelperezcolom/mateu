using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Mateu.Core.Bundle;

/// <summary>One route's export result (Java's <c>BundleEntry</c>). <see cref="Json"/> is null when
/// skipped (<see cref="Ok"/> false). A <c>:param</c> route bundled as a TEMPLATE carries the regex
/// over its sync path and its param names; <see cref="ContentJson"/> is the route's CONTENT load
/// when it lives under an app shell (the fresh load, <see cref="Json"/>, is then the shell).</summary>
internal sealed record BundleEntry(
    string Route,
    string SyncPath,
    string? Json,
    bool Ok,
    string? SkipReason = null,
    string? RoutePattern = null,
    IReadOnlyList<string>? ParamNames = null,
    string? ContentJson = null)
{
    public JsonObject ToWire() => new()
    {
        ["route"] = Route,
        ["syncPath"] = SyncPath,
        ["json"] = Json,
        ["ok"] = Ok,
        ["skipReason"] = SkipReason,
        ["routePattern"] = RoutePattern,
        ["paramNames"] = ParamNames is null ? null : new JsonArray(ParamNames.Select(n => (JsonNode?)n).ToArray()),
        ["contentJson"] = ContentJson,
    };
}

/// <summary>The whole bundle — Java's <c>BundleManifest</c>, written as the same document (same
/// members, same order): the entries, the AUTHORED route table, the REST source catalogue (shipped
/// once), the required capabilities, the raw definitions a specs-mode bundle expands in the
/// browser, the action catalogue, the translations, the environment and the mock flag.</summary>
internal sealed record BundleManifest(
    string BaseUrl,
    string GeneratedAt,
    bool StaticOnly,
    IReadOnlyList<BundleEntry> Entries,
    JsonArray? Routes = null,
    JsonArray? Sources = null,
    IReadOnlyList<string>? RequiredCapabilities = null,
    JsonObject? Definitions = null,
    JsonArray? Actions = null,
    IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>? Translations = null,
    string? Environment = null,
    bool? MockSources = null)
{
    public JsonObject ToWire()
    {
        var translations = new JsonObject();
        foreach (var (locale, messages) in Translations ?? new Dictionary<string, IReadOnlyDictionary<string, string>>())
        {
            var m = new JsonObject();
            foreach (var (k, v) in messages) m[k] = v;
            translations[locale] = m;
        }
        return new JsonObject
        {
            ["baseUrl"] = BaseUrl,
            ["generatedAt"] = GeneratedAt,
            ["staticOnly"] = StaticOnly,
            ["entries"] = new JsonArray(Entries.Select(e => (JsonNode?)e.ToWire()).ToArray()),
            ["routes"] = new JsonObject { ["routes"] = Routes?.DeepClone() ?? new JsonArray() },
            ["sources"] = new JsonObject { ["sources"] = Sources?.DeepClone() ?? new JsonArray() },
            ["requiredCapabilities"] = new JsonArray((RequiredCapabilities ?? []).Select(c => (JsonNode?)c).ToArray()),
            ["definitions"] = Definitions?.DeepClone() ?? new JsonObject(),
            ["actions"] = Actions?.DeepClone() ?? new JsonArray(),
            ["translations"] = translations,
            ["environment"] = Environment,
            ["mockSources"] = MockSources,
        };
    }

    public string ToJson() => ToWire().ToJsonString(BundleJson.Pretty);

    /// <summary>A stable identity for what the bundle CONTAINS (Java's <c>structureHash</c>): the
    /// entries' wire without the per-environment source catalogue, independent of the build time.</summary>
    public string StructureHash()
    {
        var material = string.Join("\u0001", Entries.OrderBy(e => e.Route, StringComparer.Ordinal).Select(e =>
            e.Route + "\u0000" + (e.Ok ? "true" : "false") + "\u0000" + BundleJson.WithoutCatalogue(e.Json)
            + (e.ContentJson is null ? "" : "\u0000" + BundleJson.WithoutCatalogue(e.ContentJson))));
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(material))).ToLowerInvariant();
    }
}

/// <summary>The JSON the bundle is written with: Mateu's wire contract (camelCase, nulls kept, raw
/// UTF-8 — the AspNetCore adapter's options).</summary>
internal static class BundleJson
{
    public static readonly JsonSerializerOptions Wire = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public static readonly JsonSerializerOptions Pretty = new(Wire) { WriteIndented = true };

    /// <summary>Entry JSON without the REST source catalogue an app shell carries (<c>restSources</c>).</summary>
    public static string WithoutCatalogue(string? json)
    {
        if (json is null) return "";
        if (!json.Contains("\"restSources\"")) return json;
        try
        {
            var tree = JsonNode.Parse(json);
            Drop(tree);
            return tree?.ToJsonString(Wire) ?? json;
        }
        catch (JsonException)
        {
            return json;
        }

        static void Drop(JsonNode? node)
        {
            if (node is JsonObject obj)
            {
                obj.Remove("restSources");
                foreach (var (_, v) in obj) Drop(v);
            }
            else if (node is JsonArray arr)
                foreach (var v in arr) Drop(v);
        }
    }
}
