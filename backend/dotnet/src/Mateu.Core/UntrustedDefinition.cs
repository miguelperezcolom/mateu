using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Mateu.Dtos;

namespace Mateu.Core;

/// <summary>
/// What an UNTRUSTED definition may not do (Java's <c>UntrustedDefinition</c>). A screen an agent
/// authored — the chat's <c>render-screen</c>, a live push of kind <c>render</c> — is written by an
/// LLM, which can be steered by the data it reads (prompt injection). Pairing an agent grants "drive
/// my UI", never "run code in my signed-in tab". So a shell renders such a screen through
/// <c>__preview__</c> with <c>_untrusted: true</c>, and the increment that comes back has every
/// script-capable construct taken out:
/// <list type="bullet">
///   <item>an <c>Element</c> keeps no <c>on…</c> attribute, no <c>srcdoc</c>, no <c>import</c> and no
///   unsafe url attribute (only relative / http(s) / mailto / tel); its content is TEXT
///   (<c>html</c> false); an element that loads or runs code (<c>script</c>, <c>iframe</c>,
///   <c>object</c>, <c>style</c>, <c>base</c>, <c>link</c>, <c>meta</c>, …) or a framework element
///   (<c>mateu-*</c>) becomes an empty <c>div</c>;</item>
///   <item><c>RunJS</c> rules, an action's <c>js</c>, <c>AddContentToHead</c>/<c>AddContentToBody</c>
///   commands go;</item>
///   <item>a <c>javascript:</c>/<c>vbscript:</c> url anywhere is blanked;</item>
///   <item>a <c>MicroFrontend</c> does not load from another server (its absolute <c>baseUrl</c> is
///   dropped).</item>
/// </list>
/// Same rules in Java, Python and the web renderers; shared cases:
/// <c>conformance/untrusted/cases.json</c>.
/// </summary>
internal static class UntrustedDefinition
{
    /// <summary>The <c>__preview__</c> parameter marking the definition as untrusted.</summary>
    public const string UntrustedKey = "_untrusted";

    static readonly HashSet<string> BlockedElements =
    [
        "script", "style", "iframe", "frame", "frameset", "object", "embed", "applet", "base", "link",
        "meta", "template", "portal", "noscript",
    ];
    static readonly HashSet<string> UrlAttributes =
    [
        "href", "src", "xlink:href", "action", "formaction", "background", "poster", "data", "cite", "ping",
        "srcset", "manifest", "codebase", "longdesc", "usemap", "icon",
    ];
    static readonly HashSet<string> SafeSchemes = ["http", "https", "mailto", "tel"];
    static readonly HashSet<string> CodeCommands = ["AddContentToHead", "AddContentToBody"];
    static readonly Regex Scheme = new("^([a-zA-Z][a-zA-Z0-9+.-]*):", RegexOptions.Compiled);

    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>True when the <c>__preview__</c> parameters mark the definition as untrusted.</summary>
    public static bool Requested(IReadOnlyDictionary<string, object?>? parameters)
    {
        if (parameters is null || !parameters.TryGetValue(UntrustedKey, out var flag)) return false;
        return flag switch
        {
            bool b => b,
            JsonElement { ValueKind: JsonValueKind.True } => true,
            JsonElement { ValueKind: JsonValueKind.String } el => string.Equals(el.GetString(), "true", StringComparison.OrdinalIgnoreCase),
            string s => string.Equals(s, "true", StringComparison.OrdinalIgnoreCase),
            _ => false,
        };
    }

    /// <summary>The increment with every script-capable construct taken out. Fails closed: what
    /// cannot be re-read after the walk throws rather than travel as it was.</summary>
    public static UIIncrementDto Neutralize(UIIncrementDto increment)
    {
        var node = JsonSerializer.SerializeToNode(increment, Json);
        var clean = Neutralize(node);
        return clean.Deserialize<UIIncrementDto>(Json)
            ?? throw new InvalidOperationException("The generated screen could not be rendered safely");
    }

    /// <summary>A sanitised copy of any wire JSON (a fragment, a component, an increment).</summary>
    public static JsonNode? Neutralize(JsonNode? value)
    {
        switch (value)
        {
            case null:
                return null;
            case JsonValue v when v.TryGetValue<string>(out var s):
                return JsonValue.Create(IsScriptUrl(s) ? "" : s);
            case JsonArray array:
            {
                var out_ = new JsonArray();
                foreach (var item in array)
                    if (!IsCode(item)) out_.Add(Neutralize(item));
                return out_;
            }
            case JsonObject obj:
            {
                var node = (JsonObject)obj.DeepClone();
                var type = TextOf(node["type"]);
                if (type == "Element") Element(node);
                if (type == "MicroFrontend" && TextOf(node["baseUrl"]) is { } baseUrl && IsAbsoluteUrl(baseUrl))
                    node["baseUrl"] = "";
                var out_ = new JsonObject();
                foreach (var (key, v) in node)
                {
                    if (key == "js" && TextOf(v) is not null) continue;
                    out_[key] = Neutralize(v);
                }
                return out_;
            }
            default:
                return value.DeepClone();
        }
    }

    /// <summary>Whether a definition (authored YAML read as a tree, or wire JSON) carries anything
    /// <see cref="Neutralize(JsonNode?)"/> would take out (Java's <c>scriptCapable</c>):
    /// <c>mateu_save_spec</c> refuses it (R6) — a saved spec is served through the ordinary, TRUSTED
    /// render path, so an agent could otherwise persist what the strip keeps out of a pushed screen.</summary>
    public static bool ScriptCapable(JsonNode? value)
    {
        switch (value)
        {
            case null:
                return false;
            case JsonValue v when v.TryGetValue<string>(out var s):
                return IsScriptUrl(s);
            case JsonArray array:
                return array.Any(item => IsCode(item) || ScriptCapable(item));
            case JsonObject obj:
            {
                var type = TextOf(obj["type"]);
                if (type == "Element" && ElementRunsCode(obj)) return true;
                if (type == "MicroFrontend" && TextOf(obj["baseUrl"]) is { } baseUrl && IsForeignBase(baseUrl)) return true;
                if (TextOf(obj["js"]) is { } js && !string.IsNullOrWhiteSpace(js)) return true;
                return obj.Any(entry => ScriptCapable(entry.Value));
            }
            default:
                return false;
        }
    }

    static bool ElementRunsCode(JsonObject node)
    {
        var name = (TextOf(node["name"]) ?? "").Trim().ToLowerInvariant();
        if (BlockedElements.Contains(name) || name.StartsWith("mateu-", StringComparison.Ordinal)) return true;
        var html = node["html"];
        if (html is JsonValue hv && ((hv.TryGetValue<bool>(out var b) && b)
                || (hv.TryGetValue<string>(out var hs) && string.Equals(hs.Trim(), "true", StringComparison.OrdinalIgnoreCase))))
            return true;
        if (node["attributes"] is JsonObject attributes)
        {
            foreach (var (key, v) in attributes)
            {
                var k = key.ToLowerInvariant();
                if (k is "import" or "srcdoc" || k.StartsWith("on", StringComparison.Ordinal)) return true;
                if (TextOf(v) is { } text && (IsScriptUrl(text) || (UrlAttributes.Contains(k) && !IsSafeUrl(text)))) return true;
            }
        }
        return false;
    }

    /// <summary>An absolute or network-path url, a backslash spelling of one included (<c>\\host</c>).</summary>
    static bool IsForeignBase(string value)
    {
        var c = Cleaned(value);
        return IsAbsoluteUrl(value) || c.StartsWith('\\') || c.StartsWith("/\\", StringComparison.Ordinal);
    }

    static string? TextOf(JsonNode? node) =>
        node is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    static void Element(JsonObject node)
    {
        var name = (TextOf(node["name"]) ?? "").Trim().ToLowerInvariant();
        if (BlockedElements.Contains(name) || name.StartsWith("mateu-", StringComparison.Ordinal))
        {
            node["name"] = "div";
            node["attributes"] = new JsonObject();
            node["on"] = new JsonObject();
            node["content"] = null;
            node["html"] = false;
            return;
        }
        if (node["attributes"] is JsonObject attributes)
        {
            var kept = new JsonObject();
            foreach (var (key, v) in attributes)
            {
                var k = key.ToLowerInvariant();
                if (k is "import" or "srcdoc" || k.StartsWith("on", StringComparison.Ordinal)) continue;
                if (TextOf(v) is { } text && (IsScriptUrl(text) || (UrlAttributes.Contains(k) && !IsSafeUrl(text)))) continue;
                kept[key] = v?.DeepClone();
            }
            node["attributes"] = kept;
        }
        node["html"] = false;
    }

    static bool IsCode(JsonNode? item) =>
        item is JsonObject o && (TextOf(o["action"]) == "RunJS" || (TextOf(o["type"]) is { } t && CodeCommands.Contains(t)));

    /// <summary>A url as a browser reads its scheme: tabs/newlines removed, leading controls/spaces dropped.</summary>
    static string Cleaned(string value)
    {
        var s = value.Replace("\t", "").Replace("\n", "").Replace("\r", "");
        var i = 0;
        while (i < s.Length && s[i] <= ' ') i++;
        return s[i..];
    }

    static string? SchemeOf(string value)
    {
        var m = Scheme.Match(Cleaned(value));
        return m.Success ? m.Groups[1].Value.ToLowerInvariant() : null;
    }

    internal static bool IsScriptUrl(string value) => SchemeOf(value) is "javascript" or "vbscript";

    static bool IsSafeUrl(string value) => SchemeOf(value) is not { } scheme || SafeSchemes.Contains(scheme);

    static bool IsAbsoluteUrl(string value) => SchemeOf(value) is not null || Cleaned(value).StartsWith("//", StringComparison.Ordinal);
}
