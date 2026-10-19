using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Mateu.Core.Authoring;

/// <summary>
/// Validates a YAML definition against the generated <c>specs-schema.json</c> and reports EVERY
/// problem with where it is — the authoring half of the MCP plane (<c>mateu_validate_uidl</c>).
/// C# twin of Java's <c>UidlValidator</c>: the rules are NORMATIVE (specified in
/// <c>conformance/mcp/README.md</c>, pinned by <c>conformance/mcp/authoring.json</c>), so the walk,
/// the messages, their order, the JSONPaths and the positions are the same as Java's and Python's.
/// </summary>
/// <remarks>
/// Scalars are typed by their raw text, never by a YAML resolver (resolvers differ between
/// languages): a quoted scalar is a string; a plain one is null (<c>~</c>, <c>null</c>, empty), or a
/// boolean/number/string by its text. An unknown key is a WARNING (the loader ignores it); what makes
/// the loader fail is an ERROR; semantic findings (undeclared actions, references that do not
/// resolve) are warnings. Pure: no I/O and no app state beyond the <see cref="ValidationContext"/>.
/// </remarks>
internal sealed class UidlValidator(JsonObject specsSchema)
{
    /// <summary>Largest definition accepted (UTF-8 bytes); the same limit in every implementation.</summary>
    public const int MaxYamlBytes = 262_144;

    /// <summary>Most nodes walked (an alias-bomb guard: aliases share nodes, the walk would not).</summary>
    public const int MaxNodes = 100_000;

    private static readonly Regex Int = new(@"\A[-+]?[0-9]+\z", RegexOptions.CultureInvariant);
    private static readonly Regex Float = new(@"\A[-+]?(\.[0-9]+|[0-9]+(\.[0-9]*)?)([eE][-+]?[0-9]+)?\z", RegexOptions.CultureInvariant);
    private static readonly Regex Identifier = new(@"\A[A-Za-z_][A-Za-z0-9_]*\z", RegexOptions.CultureInvariant);

    private static readonly (string Type, string Kind)[] TypedKinds =
    [
        ("UI", "mount"), ("Routes", "routes"), ("Sources", "sources"), ("Actions", "actions"),
        ("Translations", "translations"), ("Environment", "environment"), ("Types", "types"),
        ("Project", "project"),
    ];

    private readonly JsonObject _defs = specsSchema["$defs"] as JsonObject ?? new JsonObject();

    /// <summary>The validator over the embedded <c>specs-schema.json</c>.</summary>
    public static UidlValidator Default { get; } = new(AuthoringResources.SpecsSchema);

    /// <summary>Validates <paramref name="yaml"/>; never throws.</summary>
    public JsonObject Validate(string? yaml, ValidationContext? context = null) =>
        new Run(this, context ?? ValidationContext.None).Validate(yaml);

    // ── one validation ─────────────────────────────────────────────────────────────────────────

    private sealed class Run(UidlValidator v, ValidationContext context)
    {
        private readonly JsonArray _errors = [];
        private readonly JsonArray _warnings = [];
        private string? _kind;
        private HashSet<string>? _declaredActions;
        private int _visited;
        private bool _aborted;

        public JsonObject Validate(string? yaml)
        {
            if (string.IsNullOrWhiteSpace(yaml))
            {
                Issue(_errors, "empty", "The YAML is empty.", "$", null);
                return Report();
            }
            if (Encoding.UTF8.GetByteCount(yaml) > MaxYamlBytes)
            {
                Issue(_errors, "too_large", "The YAML is larger than the " + MaxYamlBytes + "-byte limit.", "$", null);
                return Report();
            }
            YNode? root;
            try
            {
                root = YamlTree.Compose(yaml);
            }
            catch (YamlTreeException e)
            {
                var at = e.Line is { } line ? new YScalar { Value = "", Line = line, Column = e.Column ?? 1 } : null;
                Issue(_errors, "yaml_syntax", e.Message, "$", at);
                return Report();
            }
            catch (Exception e)
            {
                Issue(_errors, "yaml_syntax", e.Message, "$", null);
                return Report();
            }
            if (root is null || IsNull(root))
            {
                Issue(_errors, "empty", "The YAML is empty.", "$", null);
                return Report();
            }
            ValidateRoot(root);
            return Report();
        }

        private JsonObject Report() => new()
        {
            ["valid"] = _errors.Count == 0,
            ["kind"] = _kind,
            ["errors"] = _errors,
            ["warnings"] = _warnings,
        };

        // ── root classification ──────────────────────────────────────────────────────────────

        private void ValidateRoot(YNode root)
        {
            if (root is YSequence)
            {
                _kind = "routes";
                ValidateNode(root, Branch(b => Text(b["type"]) == "array"), "$", null);
                return;
            }
            if (root is not YMapping mapping)
            {
                UnknownKind(root);
                return;
            }
            var type = ScalarText(Get(mapping, "type"));
            if (type is not null && TypedKinds.Any(k => k.Type == type))
            {
                _kind = TypedKinds.First(k => k.Type == type).Kind;
                ValidateObject(mapping, Branch(b => type == ConstOf(b)), "$", null, null);
                return;
            }
            if (type is not null || Get(mapping, "type") is not null)
            {
                // a component at the root: a page (or an app shell), with the page-level keys beside it
                _kind = "component";
                var pageBranch = Branch(b => b.ContainsKey("allOf"));
                var pageKeys = (pageBranch["allOf"] as JsonArray)?[1]?["properties"] as JsonObject;
                PrepareActionCheck(mapping, type != "AppShell");
                ValidateDiscriminated(mapping, (JsonObject)v._defs["Component"]!, "Component", "$", pageKeys);
                return;
            }
            if (Has(mapping, "layout") || Has(mapping, "layoutDelta"))
            {
                _kind = "envelope";
                PrepareActionCheck(mapping, true);
                ValidateObject(mapping, Branch(b => Props(b)?.ContainsKey("layout") == true), "$", null, null);
                return;
            }
            string? typeless = null;
            Func<JsonObject, bool>? which = null;
            if (Has(mapping, "content"))
            {
                typeless = "partial";
                which = b => b["required"] is JsonArray { Count: 1 } r && r[0] is JsonValue rv
                             && rv.TryGetValue<string>(out var s) && s == "content";
            }
            else if (Has(mapping, "components"))
            {
                typeless = "components";
                which = b => Props(b)?.ContainsKey("components") == true;
            }
            else if (Has(mapping, "routes"))
            {
                typeless = "routes";
                which = b => ConstOf(b) == "Routes";
            }
            else if (Has(mapping, "actions"))
            {
                typeless = "actions";
                which = b => ConstOf(b) == "Actions";
            }
            else if (Has(mapping, "types"))
            {
                typeless = "types";
                which = b => ConstOf(b) == "Types";
            }
            else if (Has(mapping, "messages"))
            {
                typeless = "translations";
                which = b => ConstOf(b) == "Translations";
            }
            else if (Get(mapping, "sources") is YSequence)
            {
                typeless = "sources";
                which = b => ConstOf(b) == "Sources";
            }
            else if (Get(mapping, "sources") is YMapping)
            {
                typeless = "environment";
                which = b => ConstOf(b) == "Environment";
            }
            if (typeless is null || which is null)
            {
                UnknownKind(root);
                return;
            }
            _kind = typeless;
            ValidateObject(mapping, Branch(which), "$", null, null);
        }

        private void UnknownKind(YNode root) =>
            Issue(_errors, "unknown_kind",
                "Cannot tell what kind of definition this is: give it a `type:` (a component such as"
                + " VerticalLayout, or a file kind such as UI, Routes or Sources), or a `layout:`,"
                + " `content:` or `components:` key.",
                "$", root);

        private JsonObject Branch(Func<JsonObject, bool> predicate)
        {
            if (v.SpecsOneOf is { } branches)
                foreach (var branch in branches)
                    if (branch is JsonObject b && predicate(b)) return b;
            throw new InvalidOperationException("specs-schema.json lacks an expected root branch");
        }

        private static string? ConstOf(JsonObject branch) =>
            Props(branch)?["type"] is JsonObject t && t["const"] is JsonValue c && c.TryGetValue<string>(out var s) ? s : null;

        /// <summary>The page's own declared action ids, unless a view model is named (it owns the actions).</summary>
        private void PrepareActionCheck(YMapping root, bool applies)
        {
            if (!applies || !Blank(ScalarText(Get(root, "viewModel"))) || !Blank(ScalarText(Get(root, "modelView"))))
                return;
            _declaredActions = new HashSet<string>(StringComparer.Ordinal);
            if (Get(root, "actions") is YSequence list)
                foreach (var item in list.Items)
                    if (item is YMapping action && ScalarText(Get(action, "id")) is { } id)
                        _declaredActions.Add(id);
        }

        // ── the walk ─────────────────────────────────────────────────────────────────────────

        private void ValidateNode(YNode node, JsonObject schema, string path, string? key)
        {
            if (!Count()) return;
            string? defName = null;
            while (schema.ContainsKey("$ref"))
            {
                defName = Text(schema["$ref"])["#/$defs/".Length..];
                schema = v._defs[defName] as JsonObject ?? new JsonObject();
            }
            if (IsNull(node)) return;
            if (schema.ContainsKey("oneOf"))
            {
                ValidateDiscriminated(node, schema, defName, path, null);
                return;
            }
            if (schema.ContainsKey("enum"))
            {
                if (node is not YScalar scalar)
                {
                    WrongType(node, "a string", path);
                    return;
                }
                var allowed = (schema["enum"] as JsonArray ?? []).Select(Text).ToList();
                if (!allowed.Contains(scalar.Value))
                    Issue(_errors, "invalid_value",
                        Quote(scalar.Value) + " is not a valid " + (key ?? "value") + " — use one of: "
                        + string.Join(", ", allowed) + ".",
                        path, node);
                return;
            }
            var types = TypesOf(schema);
            if (types.Count > 0 && !Fits(node, types))
            {
                WrongType(node, Expected(types), path);
                return;
            }
            if (node is YMapping mapping && (schema.ContainsKey("properties") || schema.ContainsKey("additionalProperties")))
            {
                ValidateObject(mapping, schema, path, defName, null);
            }
            else if (node is YSequence list && schema["items"] is JsonObject items)
            {
                var i = 0;
                foreach (var item in list.Items) ValidateNode(item, items, path + "[" + i++ + "]", key);
            }
        }

        private void ValidateDiscriminated(YNode node, JsonObject family, string? familyName, string path, JsonObject? extraKeys)
        {
            if (node is not YMapping mapping)
            {
                WrongType(node, "a mapping", path);
                return;
            }
            var typeNode = Get(mapping, "type");
            if (typeNode is null || IsNull(typeNode))
            {
                Issue(_errors, "missing_type", "Missing \"type\": a " + familyName + " must say which one it is.", path, mapping);
                return;
            }
            if (typeNode is not YScalar typeScalar)
            {
                WrongType(typeNode, "a string", path + ".type");
                return;
            }
            var type = typeScalar.Value;
            var candidates = new List<string>();
            string? member = null;
            foreach (var reference in family["oneOf"] as JsonArray ?? [])
            {
                var name = Text(reference?["$ref"]);
                name = name.StartsWith("#/$defs/", StringComparison.Ordinal) ? name["#/$defs/".Length..] : name;
                var c = v._defs[name]?["properties"]?["type"]?["const"] is JsonValue cv && cv.TryGetValue<string>(out var cs)
                    ? cs
                    : name;
                candidates.Add(c);
                if (c == type) member = name;
            }
            if (member is null)
            {
                var suggestion = Suggest(type, candidates);
                Issue(_errors, "unknown_type",
                    "Unknown " + familyName + " type " + Quote(type) + "."
                    + (suggestion is not null ? " Did you mean " + Quote(suggestion) + "?" : ""),
                    path + ".type", typeNode);
                return;
            }
            ValidateObject(mapping, v._defs[member] as JsonObject ?? new JsonObject(), path, member, extraKeys);
        }

        private void ValidateObject(YMapping mapping, JsonObject schema, string path, string? defName, JsonObject? extraKeys)
        {
            var properties = Props(schema);
            foreach (var required in schema["required"] as JsonArray ?? [])
            {
                var name = Text(required);
                if (Get(mapping, name) is null)
                    Issue(_errors, "missing_required", "Missing required key " + Quote(name) + ".", path, mapping);
            }
            var additional = schema["additionalProperties"] as JsonObject;
            foreach (var (keyNode, value) in mapping.Entries)
            {
                if (_aborted) return;
                if (keyNode is not YScalar keyScalar) continue;
                var key = keyScalar.Value;
                var childPath = path + Segment(key);
                var propertySchema = properties?[key] as JsonObject ?? extraKeys?[key] as JsonObject;
                if (propertySchema is not null)
                {
                    Semantic(defName, key, value, childPath);
                    ValidateNode(value, propertySchema, childPath, key);
                }
                else if (additional is not null)
                {
                    ValidateNode(value, additional, childPath, key);
                }
                else if (schema.ContainsKey("properties"))
                {
                    var known = new List<string>();
                    if (properties is not null) known.AddRange(properties.Select(p => p.Key));
                    if (extraKeys is not null) known.AddRange(extraKeys.Select(p => p.Key));
                    var suggestion = Suggest(key, known);
                    Issue(_warnings, "unknown_property",
                        "Unknown key " + Quote(key) + " (ignored)."
                        + (suggestion is not null
                            ? " Did you mean " + Quote(suggestion) + "?"
                            : " Known keys here: " + string.Join(", ", known) + "."),
                        childPath, keyNode);
                }
            }
        }

        // ── semantic checks ──────────────────────────────────────────────────────────────────

        private void Semantic(string? defName, string key, YNode value, string path)
        {
            var text = ScalarText(value);
            if (Blank(text)) return;
            if (key == "ref" && defName == "RestDataSource")
                Resolves(context.Source, text!, "unresolved_source",
                    "Source " + Quote(text!) + " is not in the source catalogue (sources.yaml).", path, value);
            else if (key == "ref" && defName == "Partial")
                Resolves(context.Partial, text!, "unresolved_partial",
                    "Partial " + Quote(text!) + " does not exist (specs/ui/partials/).", path, value);
            else if (key == "ref" && defName == "ComponentRef")
                Resolves(context.Component, text!, "unresolved_component",
                    "Component " + Quote(text!) + " is not in the business component catalogue (components.yaml).", path, value);
            else if (key == "fieldType")
                Resolves(context.FieldType, text!, "unresolved_field_type",
                    "Field type " + Quote(text!) + " is not in the field type catalogue (types.yaml).", path, value);
            else if (_declaredActions is not null
                     && (key == "actionId" || key.EndsWith("ActionId", StringComparison.Ordinal))
                     && !_declaredActions.Contains(text!)
                     && (context.Action is null || !context.Action(text!)))
                Issue(_warnings, "undeclared_action",
                    "Action " + Quote(text!) + " is not declared in this page's actions: (or the action catalogue); it only"
                    + " runs if the view model bound to the page has an action of that name.",
                    path, value);
        }

        private void Resolves(Func<string, bool>? known, string name, string code, string message, string path, YNode at)
        {
            if (known is not null && !known(name)) Issue(_warnings, code, message, path, at);
        }

        // ── helpers ──────────────────────────────────────────────────────────────────────────

        private bool Count()
        {
            if (_aborted) return false;
            if (++_visited > MaxNodes)
            {
                _aborted = true;
                Issue(_errors, "too_complex", "The YAML is too complex to validate (more than " + MaxNodes + " nodes).", "$", null);
                return false;
            }
            return true;
        }

        private void WrongType(YNode node, string expected, string path) =>
            Issue(_errors, "wrong_type", "Expected " + expected + ", found " + Found(node) + ".", path, node);

        private static void Issue(JsonArray into, string code, string message, string path, YNode? at)
        {
            var issue = new JsonObject { ["code"] = code, ["message"] = message, ["path"] = path };
            if (at is not null)
            {
                issue["line"] = at.Line;
                issue["column"] = at.Column;
            }
            into.Add(issue);
        }
    }

    private JsonArray? SpecsOneOf => specsSchema["oneOf"] as JsonArray;

    // ── scalar typing (normative, see the class docs) ──────────────────────────────────────────

    private static bool IsNull(YNode node) =>
        node is YScalar { Plain: true } s
        && (s.Value.Length == 0 || s.Value == "~" || string.Equals(s.Value, "null", StringComparison.OrdinalIgnoreCase));

    private static List<string> TypesOf(JsonObject schema) => schema["type"] switch
    {
        null => [],
        JsonArray list => list.Select(Text).ToList(),
        var single => [Text(single)],
    };

    private static bool Fits(YNode node, List<string> types)
    {
        foreach (var type in types)
        {
            var ok = type switch
            {
                "object" => node is YMapping,
                "array" => node is YSequence,
                "string" => node is YScalar,
                "boolean" => node is YScalar s
                             && (string.Equals(s.Value, "true", StringComparison.OrdinalIgnoreCase)
                                 || string.Equals(s.Value, "false", StringComparison.OrdinalIgnoreCase)),
                "integer" => node is YScalar s && Int.IsMatch(s.Value.Trim()),
                "number" => node is YScalar s && (Int.IsMatch(s.Value.Trim()) || Float.IsMatch(s.Value.Trim())),
                _ => true,
            };
            if (ok) return true;
        }
        return false;
    }

    private static string Expected(List<string> types)
    {
        var words = types.Select(t => t switch
        {
            "string" => "a string",
            "boolean" => "a boolean",
            "integer" => "an integer",
            "number" => "a number",
            "object" => "a mapping",
            "array" => "a list",
            _ => t,
        }).ToList();
        return words.Count == 1 ? words[0] : string.Join(", ", words.Take(words.Count - 1)) + " or " + words[^1];
    }

    private static string Found(YNode node) => node switch
    {
        YMapping => "a mapping",
        YSequence => "a list",
        YScalar s => Quote(s.Value),
        _ => "a node",
    };

    /// <summary>A value in a message: double-quoted, with <c>\</c> and <c>"</c> escaped.</summary>
    public static string Quote(string value) => "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";

    /// <summary>A JSONPath segment for a mapping key.</summary>
    internal static string Segment(string key) =>
        Identifier.IsMatch(key) ? "." + key : "['" + key.Replace("\\", "\\\\").Replace("'", "\\'") + "']";

    /// <summary>The closest candidate (case-insensitive; equal ignoring case first, else the smallest
    /// edit distance ≤ 2 that is also shorter than the value; ties go to the earlier candidate), or null.</summary>
    public static string? Suggest(string value, IReadOnlyList<string> candidates)
    {
        var lower = value.ToLowerInvariant();
        foreach (var c in candidates)
            if (c.ToLowerInvariant() == lower) return c;
        string? best = null;
        var bestDistance = int.MaxValue;
        foreach (var c in candidates)
        {
            var d = Levenshtein(lower, c.ToLowerInvariant());
            if (d < bestDistance)
            {
                bestDistance = d;
                best = c;
            }
        }
        return best is not null && bestDistance <= 2 && bestDistance < value.Length ? best : null;
    }

    internal static int Levenshtein(string a, string b)
    {
        var previous = new int[b.Length + 1];
        var current = new int[b.Length + 1];
        for (var j = 0; j <= b.Length; j++) previous[j] = j;
        for (var i = 1; i <= a.Length; i++)
        {
            current[0] = i;
            for (var j = 1; j <= b.Length; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                current[j] = Math.Min(Math.Min(current[j - 1] + 1, previous[j] + 1), previous[j - 1] + cost);
            }
            (previous, current) = (current, previous);
        }
        return previous[b.Length];
    }

    private static YNode? Get(YMapping mapping, string key)
    {
        foreach (var (k, value) in mapping.Entries)
            if (k is YScalar s && s.Value == key) return value;
        return null;
    }

    private static bool Has(YMapping mapping, string key) => Get(mapping, key) is not null;

    private static string? ScalarText(YNode? node) => node is YScalar s && !IsNull(s) ? s.Value : null;

    private static bool Blank(string? s) => string.IsNullOrWhiteSpace(s);

    private static JsonObject? Props(JsonObject schema) => schema["properties"] as JsonObject;

    /// <summary>A schema value as text (Jackson's <c>asText</c>): a string as is, anything else as JSON.</summary>
    private static string Text(JsonNode? node) => node switch
    {
        null => "",
        JsonValue v when v.TryGetValue<string>(out var s) => s,
        _ => node.ToJsonString(),
    };
}
