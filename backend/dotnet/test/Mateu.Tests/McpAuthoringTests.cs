using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Core.Authoring;
using Mateu.Core.Mcp;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The MCP authoring plane (phase B) of the .NET backend: <c>conformance/mcp/authoring.json</c>
/// — the contract shared with Java, Python and the sidecar — section by section, plus resources/read,
/// the protocol errors, mateu_save_spec in and out of development mode (with its path rule), the
/// forbidden / generic error texts and the load check. The .NET twin of Java's
/// McpAuthoringCorpusTest + McpAuthoringSyncTest.</summary>
public class McpAuthoringTests
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    [UI("mcp-authoring-home"), Title("Authoring home")]
    public class AuthoringHome
    {
        public string Name { get; set; } = "x";
    }

    [UI("mcp-authoring-guarded"), Title("Guarded")]
    public class AuthoringGuarded
    {
        public string Name { get; set; } = "x";
        [Button, EyesOnly(Roles = ["admin"])] public string Purge() => "purged";
        [Button] public string Explode() => throw new InvalidOperationException("db password is hunter2");
    }

    static readonly SyncHandler Handler = new(new MateuRegistry(typeof(AuthoringHome).Assembly));

    static McpService Service() => new(Handler, Json);

    static JsonObject Corpus()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "conformance", "mcp"))) dir = dir.Parent;
        Assert.NotNull(dir);
        return (JsonObject)JsonNode.Parse(File.ReadAllText(Path.Combine(dir!.FullName, "conformance", "mcp", "authoring.json")))!;
    }

    /// <summary>Byte for byte: same keys, same order, same values.</summary>
    static void Same(JsonNode? expected, JsonNode? actual, string what) =>
        Assert.True(expected?.ToJsonString() == actual?.ToJsonString(),
            $"{what}\nexpected: {expected?.ToJsonString()}\nactual:   {actual?.ToJsonString()}");

    static JsonNode? Call(McpService svc, string method, JsonObject? pars = null, bool dev = false, string? specsDir = null) =>
        McpJsonRpc.Handle(new JsonObject { ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = method, ["params"] = pars }, svc, dev, specsDir);

    static (bool IsError, string Text) Tool(McpService svc, string name, JsonObject arguments, bool dev = false, string? specsDir = null)
    {
        var r = Call(svc, "tools/call", new JsonObject { ["name"] = name, ["arguments"] = arguments }, dev, specsDir);
        var result = r!["result"]!;
        return (result["isError"]?.GetValue<bool>() == true, (string)result["content"]![0]!["text"]!);
    }

    static ValidationContext ContextOf(JsonNode? c)
    {
        if (c is not JsonObject o) return ValidationContext.None;
        static IEnumerable<string>? Names(JsonNode? n) => n is JsonArray a ? a.Select(x => (string)x!).ToList() : null;
        return ValidationContext.Of(Names(o["sources"]), Names(o["partials"]), Names(o["components"]),
            Names(o["actions"]), Names(o["fieldTypes"]));
    }

    static JsonObject Normalized(JsonObject report)
    {
        foreach (var list in new[] { "errors", "warnings" })
            foreach (var issue in report[list]!.AsArray().OfType<JsonObject>())
                if ((string?)issue["code"] == "yaml_syntax")
                {
                    issue.Remove("message");
                    issue.Remove("line");
                    issue.Remove("column");
                }
        return report;
    }

    // ── the corpus ───────────────────────────────────────────────────────────────────────────

    [Fact]
    public void Tools_list_outside_dev_mode_is_the_corpus()
    {
        var tools = Call(Service(), "tools/list")!["result"]!["tools"];
        Same(Corpus()["tools"], tools, "tools/list");
    }

    [Fact]
    public void Dev_mode_appends_the_corpus_dev_tools()
    {
        var all = McpJsonRpc.Tools(true);
        var plain = McpJsonRpc.Tools(false);
        var extra = new JsonArray(all.Skip(plain.Count).Select(t => t!.DeepClone()).ToArray());
        Same(Corpus()["devTools"], extra, "devTools");
        Same(Corpus()["devTools"], new JsonArray(Call(Service(), "tools/list", dev: true)!["result"]!["tools"]!
            .AsArray().Skip(plain.Count).Select(t => t!.DeepClone()).ToArray()), "devTools over tools/list");
    }

    [Fact]
    public void Resources_list_is_the_corpus()
    {
        Same(Corpus()["resources"], Call(Service(), "resources/list")!["result"]!["resources"], "resources/list");
    }

    [Fact]
    public void Every_validation_case_matches_the_corpus()
    {
        foreach (var c in Corpus()["validate"]!.AsArray())
        {
            var report = Normalized(UidlValidator.Default.Validate((string)c!["yaml"]!, ContextOf(c["context"])));
            Same(c["expected"], report, (string)c["name"]!);
        }
    }

    [Fact]
    public void Every_preview_case_matches_the_corpus()
    {
        foreach (var c in Corpus()["preview"]!.AsArray())
        {
            var preview = Service().Preview((string)c!["yaml"]!, "");
            var summary = new JsonObject
            {
                ["rendered"] = preview["rendered"]?.GetValue<bool>(),
                ["fields"] = preview["screen"]?["fields"]?.DeepClone(),
                ["actions"] = preview["screen"]?["actions"]?.DeepClone(),
                ["validation"] = preview["validation"]?.DeepClone(),
            };
            Same(c["expected"], summary, (string)c["name"]!);
        }
    }

    [Fact]
    public void Every_list_components_case_matches_the_corpus()
    {
        foreach (var c in Corpus()["listComponents"]!.AsArray())
        {
            var listed = ComponentSchemas.List((string)c!["query"]!);
            if (c["expectedCount"] is { } count) Same(count, listed["count"], "count");
            else Same(c["expected"], listed, (string)c["query"]!);
        }
    }

    [Fact]
    public void Every_component_schema_case_matches_the_corpus()
    {
        foreach (var c in Corpus()["componentSchemas"]!.AsArray())
        {
            var type = (string)c!["type"]!;
            if (c["expectedError"] is { } error)
            {
                var e = Assert.Throws<UserFacingException>(() => ComponentSchemas.SchemaOf(type));
                Assert.Equal((string)error!, e.Message);
                var (isError, text) = Tool(Service(), "mateu_get_component_schema", new JsonObject { ["type"] = type });
                Assert.True(isError);
                Assert.Equal("Error: " + (string)error!, text);
            }
            else
            {
                Same(c["expected"], ComponentSchemas.SchemaOf(type), type);
            }
        }
    }

    // ── protocol ─────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void Initialize_advertises_tools_and_resources()
    {
        var r = Call(Service(), "initialize")!["result"]!;
        Assert.Equal("""{"tools":{},"resources":{}}""", r["capabilities"]!.ToJsonString());
        Assert.Equal("2024-11-05", (string?)r["protocolVersion"]);
    }

    [Fact]
    public void Resources_read_serves_the_files_verbatim()
    {
        var root = new DirectoryInfo(AppContext.BaseDirectory);
        while (root is not null && !Directory.Exists(Path.Combine(root.FullName, "conformance"))) root = root.Parent;
        foreach (var (uri, file) in new[]
                 {
                     ("mateu://guide", "authoring-guide.md"), ("mateu://catalog", "uidl-catalog.json"),
                     ("mateu://schema/specs", "specs-schema.json"), ("mateu://schema/uidl", "uidl-schema.json"),
                 })
        {
            var content = Call(Service(), "resources/read", new JsonObject { ["uri"] = uri })!["result"]!["contents"]![0]!;
            Assert.Equal(uri, (string?)content["uri"]);
            Assert.Equal(File.ReadAllText(Path.Combine(root!.FullName, "backend", "shared", "uidl", file)), (string?)content["text"]);
        }
        Assert.Equal("text/markdown",
            (string?)Call(Service(), "resources/read", new JsonObject { ["uri"] = "mateu://guide" })!["result"]!["contents"]![0]!["mimeType"]);
    }

    [Fact]
    public void Resources_read_errors()
    {
        var missing = Call(Service(), "resources/read", new JsonObject())!["error"]!;
        Assert.Equal(-32602, (int)missing["code"]!);
        Assert.Equal("Invalid params: uri is required", (string?)missing["message"]);
        var unknown = Call(Service(), "resources/read", new JsonObject { ["uri"] = "mateu://nope" })!["error"]!;
        Assert.Equal(-32002, (int)unknown["code"]!);
        Assert.Equal("Resource not found: mateu://nope", (string?)unknown["message"]);
    }

    [Fact]
    public void A_json_value_that_is_not_an_object_is_an_invalid_request()
    {
        foreach (var message in new JsonNode?[] { JsonValue.Create(3), new JsonArray(), JsonValue.Create("x"), null })
            Assert.Equal("""{"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"Invalid Request"}}""",
                McpJsonRpc.Handle(message, Service())!.ToJsonString());
    }

    [Fact]
    public void Caller_mistakes_are_shown_as_written()
    {
        Assert.Equal((true, "Error: Unknown tool: x"), Tool(Service(), "x", new JsonObject()));
        Assert.Equal((true, "Error: Missing argument \"yaml\"."), Tool(Service(), "mateu_validate_uidl", new JsonObject()));
        Assert.Equal((true, "Error: Missing argument \"type\"."), Tool(Service(), "mateu_get_component_schema", new JsonObject()));
    }

    // ── validate / preview over the app ──────────────────────────────────────────────────────

    [Fact]
    public void Validate_goes_through_the_reserved_action_and_answers_the_report()
    {
        var increment = Handler.Handle(new Mateu.Dtos.RunActionRqDto
        {
            Route = "", ActionId = "__validate__",
            Parameters = new Dictionary<string, object?> { ["_yaml"] = JsonSerializer.SerializeToElement("foo: bar\n") },
        });
        var appData = Assert.IsType<Dictionary<string, object?>>(increment.AppData);
        var report = Assert.IsType<JsonObject>(appData["_validation"]);
        Assert.Equal("unknown_kind", (string?)report["errors"]![0]!["code"]);

        var (isError, text) = Tool(Service(), "mateu_validate_uidl", new JsonObject { ["yaml"] = "type: Routes\n" });
        Assert.False(isError);
        var viaMcp = JsonNode.Parse(text)!;
        Assert.Equal("routes", (string?)viaMcp["kind"]);
        Assert.Equal("missing_required", (string?)viaMcp["errors"]![0]!["code"]);
    }

    [Fact]
    public void The_limits_and_the_syntax_errors_are_reported_with_their_codes()
    {
        var syntax = UidlValidator.Default.Validate("type: Text\ntext: a: b\n")["errors"]![0]!;
        Assert.Equal("yaml_syntax", (string?)syntax["code"]);
        Assert.Equal(2, (int)syntax["line"]!);

        var large = UidlValidator.Default.Validate("type: Text\ntext: " + new string('x', UidlValidator.MaxYamlBytes) + "\n");
        Assert.Equal("""[{"code":"too_large","message":"The YAML is larger than the 262144-byte limit.","path":"$"}]""",
            large["errors"]!.ToJsonString(new JsonSerializerOptions { Encoder = Json.Encoder }));

        var complex = UidlValidator.Default.Validate("[" + string.Join(",", Enumerable.Repeat("~", UidlValidator.MaxNodes + 1)) + "]");
        Assert.Equal("too_complex", (string?)complex["errors"]!.AsArray().Single()!["code"]);

        // a duplicate key is not a crash: both entries are walked
        var duplicate = UidlValidator.Default.Validate("type: FormField\nid: a\nlabl: x\nlabl: y\n");
        Assert.Equal(2, duplicate["warnings"]!.AsArray().Count);
    }

    [Fact]
    public void A_definition_the_loader_cannot_build_is_load_failed()
    {
        // structurally fine (the validator types scalars by their text, ignoring tags), but the loader
        // refuses a tag it cannot resolve
        var report = Service().Validate("type: Text\ntext: !custom hello\n");
        Assert.False(report["valid"]!.GetValue<bool>());
        var issue = report["errors"]!.AsArray().Single()!;
        Assert.Equal("load_failed", (string?)issue["code"]);
        Assert.Equal("$", (string?)issue["path"]);
        Assert.StartsWith("The definition could not be loaded: ", (string?)issue["message"]);
    }

    [Fact]
    public void Preview_refuses_what_is_invalid_or_not_a_page()
    {
        var invalid = Service().Preview("type: Buton\n", "");
        Assert.False(invalid["rendered"]!.GetValue<bool>());
        Assert.Equal("The definition has errors; fix them first.", (string?)invalid["reason"]);
        var routes = Service().Preview("- route: home\n  layout: home.yaml\n", "");
        Assert.False(routes["rendered"]!.GetValue<bool>());
        Assert.Equal("Only a page (a component, or a layout: envelope) can be previewed.", (string?)routes["reason"]);
        Assert.Null(routes["screen"]);
    }

    [Fact]
    public void The_preview_action_says_why_a_yaml_cannot_be_read()
    {
        var increment = Handler.Handle(new Mateu.Dtos.RunActionRqDto
        {
            Route = "", ActionId = "__preview__",
            Parameters = new Dictionary<string, object?> { ["_yaml"] = JsonSerializer.SerializeToElement("type: Text\ntext: a: b\n") },
        });
        Assert.Contains("Invalid YAML — ", JsonSerializer.Serialize(increment, Json));
    }

    // ── errors ───────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void A_refused_request_is_the_tool_error_forbidden()
    {
        var (isError, text) = Tool(Service(), "mateu_run_action",
            new JsonObject { ["route"] = "mcp-authoring-guarded", ["actionId"] = "purge" });
        Assert.True(isError);
        Assert.Equal("Error: Forbidden", text);
    }

    [Fact]
    public void A_failing_action_answers_its_screen_with_the_generic_message()
    {
        var (isError, text) = Tool(Service(), "mateu_run_action",
            new JsonObject { ["route"] = "mcp-authoring-guarded", ["actionId"] = "explode" });
        Assert.False(isError);
        Assert.DoesNotContain("hunter2", text);
        Assert.Contains("An unexpected error occurred. Reference: ", text);
    }

    [Fact]
    public void Anything_else_failing_is_the_generic_text_with_a_reference()
    {
        Assert.Matches("^An unexpected error occurred\\. Reference: [0-9a-f]{12}$",
            McpJsonRpc.ErrorText(new InvalidOperationException("secret detail"), "mateu_x"));
        Assert.Equal("You did it wrong", McpJsonRpc.ErrorText(new UserFacingException("You did it wrong"), "mateu_x"));
    }

    // ── save_spec ────────────────────────────────────────────────────────────────────────────

    const string Page = "type: VerticalLayout\ncontent:\n  - type: Text\n    text: Hi\n";

    static string TempDir()
    {
        var dir = Path.Combine(Path.GetTempPath(), "mateu-mcp-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);
        return dir;
    }

    [Fact]
    public void Save_spec_is_neither_listed_nor_callable_outside_dev_mode()
    {
        var dir = TempDir();
        var names = Call(Service(), "tools/list")!["result"]!["tools"]!.AsArray().Select(t => (string?)t!["name"]);
        Assert.DoesNotContain("mateu_save_spec", names);
        Assert.Equal((true, "Error: Unknown tool: mateu_save_spec"),
            Tool(Service(), "mateu_save_spec", new JsonObject { ["path"] = "a.yaml", ["yaml"] = Page }, dev: false, specsDir: dir));
        Assert.False(File.Exists(Path.Combine(dir, "a.yaml")));
    }

    [Fact]
    public void Save_spec_writes_a_valid_definition_in_dev_mode()
    {
        var dir = TempDir();
        var (isError, text) = Tool(Service(), "mateu_save_spec",
            new JsonObject { ["path"] = "partials/greeting.yaml", ["yaml"] = Page }, dev: true, specsDir: dir);
        Assert.False(isError, text);
        var result = JsonNode.Parse(text)!;
        Assert.True(result["saved"]!.GetValue<bool>());
        Assert.Equal("partials/greeting.yaml", (string?)result["path"]);
        Assert.Equal(System.Text.Encoding.UTF8.GetByteCount(Page), (int)result["bytes"]!);
        Assert.Equal(Page, File.ReadAllText(Path.Combine(dir, "partials", "greeting.yaml")));
    }

    [Fact]
    public void Save_spec_writes_nothing_with_errors()
    {
        var dir = TempDir();
        var (_, text) = Tool(Service(), "mateu_save_spec",
            new JsonObject { ["path"] = "bad.yaml", ["yaml"] = "type: Buton\n" }, dev: true, specsDir: dir);
        var result = JsonNode.Parse(text)!;
        Assert.False(result["saved"]!.GetValue<bool>());
        Assert.Equal("The definition has errors; nothing was written.", (string?)result["reason"]);
        Assert.False(File.Exists(Path.Combine(dir, "bad.yaml")));
    }

    [Fact]
    public void Save_spec_without_a_specs_directory_says_which_setting()
    {
        Assert.Equal((true, "Error: No specs directory found (set MATEU_DEV_SPECS_DIR)."),
            Tool(Service(), "mateu_save_spec", new JsonObject { ["path"] = "a.yaml", ["yaml"] = Page },
                dev: true, specsDir: Path.Combine(Path.GetTempPath(), "mateu-mcp-missing-" + Guid.NewGuid().ToString("N"))));
    }

    [Theory]
    [InlineData("../escape.yaml")]
    [InlineData("a/../../escape.yaml")]
    [InlineData("/etc/escape.yaml")]
    [InlineData("./a.yaml")]
    [InlineData("a.txt")]
    [InlineData("a\\b.yaml")]
    [InlineData("C:x.yaml")]
    [InlineData("a//b.yaml")]
    [InlineData("")]
    public void Save_spec_refuses_a_path_outside_the_rule(string path)
    {
        var dir = TempDir();
        var (isError, text) = Tool(Service(), "mateu_save_spec",
            new JsonObject { ["path"] = path, ["yaml"] = Page }, dev: true, specsDir: dir);
        Assert.True(isError);
        Assert.Equal("Error: " + SpecWriter.Refusal(path), text);
        Assert.Equal("Invalid path " + UidlValidator.Quote(path)
                     + ": give a relative .yaml or .yml path inside the specs directory (no \"..\", no absolute path).",
            SpecWriter.Refusal(path));
    }

    [Fact]
    public void Save_spec_refuses_a_symbolic_link_out_of_the_specs_directory()
    {
        var dir = TempDir();
        var outside = TempDir();
        try
        {
            Directory.CreateSymbolicLink(Path.Combine(dir, "out"), outside);
        }
        catch (Exception e) when (e is IOException or UnauthorizedAccessException or PlatformNotSupportedException)
        {
            return; // the OS does not let this process create links (Windows without the privilege)
        }
        var (isError, text) = Tool(Service(), "mateu_save_spec",
            new JsonObject { ["path"] = "out/escape.yaml", ["yaml"] = Page }, dev: true, specsDir: dir);
        Assert.True(isError);
        Assert.Equal("Error: " + SpecWriter.Refusal("out/escape.yaml"), text);
        Assert.False(File.Exists(Path.Combine(outside, "escape.yaml")));

        // a link to a file outside
        var target = Path.Combine(outside, "target.yaml");
        File.WriteAllText(target, "x");
        File.CreateSymbolicLink(Path.Combine(dir, "linked.yaml"), target);
        Assert.Throws<UserFacingException>(() => SpecWriter.Write(dir, "linked.yaml", Page));
        Assert.Equal("x", File.ReadAllText(target));

        // a link that stays inside is fine
        Directory.CreateDirectory(Path.Combine(dir, "real"));
        Directory.CreateSymbolicLink(Path.Combine(dir, "alias"), Path.Combine(dir, "real"));
        Assert.Equal(Page.Length, SpecWriter.Write(dir, "alias/ok.yaml", Page));
        Assert.True(File.Exists(Path.Combine(dir, "real", "ok.yaml")));
    }
}
