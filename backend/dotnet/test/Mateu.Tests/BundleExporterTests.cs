using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Core.Bundle;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests
{
    using Bundle;

    /// <summary>The static-bundle exporter (<c>Mateu.Core.Bundle</c>): what it renders, what it ships,
    /// what it refuses with <c>--static</c>, and the files it writes — the .NET twin of Java's
    /// <c>MateuBundleExporterTest</c> / <c>StaticSafetyCheckTest</c> / <c>BundleContentLoadTest</c>.</summary>
    public class BundleExporterTests
    {
        private static readonly string Renderer = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,
            "../../../../../../shared/frontend/vaadin-lit/src/main/resources/static"));

        private static BundleExporter CodeExporter() =>
            new(new SyncHandler(new MateuRegistry(typeof(BundleHello).Assembly)), Path.Combine(Path.GetTempPath(), "no-specs"));

        private static string Specs(Dictionary<string, string> files)
        {
            var dir = Path.Combine(Path.GetTempPath(), "mateu-bundle-" + Guid.NewGuid().ToString("N"), "specs", "ui");
            foreach (var (name, text) in files)
            {
                var file = Path.Combine(dir, name);
                Directory.CreateDirectory(Path.GetDirectoryName(file)!);
                File.WriteAllText(file, text);
            }
            return dir;
        }

        private static BundleExporter YamlExporter(string specs) =>
            new(new SyncHandler(new MateuRegistry(typeof(Form).Assembly), specsDir: specs), specs);

        private static readonly Dictionary<string, string> Orders = new()
        {
            ["routes.yaml"] = "routes:\n  - route: orders/:id\n    layout: order.yaml\n  - route: about\n    layout: about.yaml\n",
            ["order.yaml"] = "layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: Order\n",
            ["about.yaml"] = "layout:\n  type: VerticalLayout\n  content:\n    - type: Partial\n      ref: footer\n",
            ["partials/footer.yaml"] = "content:\n  - type: Text\n    text: One\n  - type: Text\n    text: Two\n",
        };

        [Fact]
        public void Sync_paths_mirror_the_browser()
        {
            Assert.Equal("_no_route", BundleExporter.ToSyncPath(""));
            Assert.Equal("_no_route", BundleExporter.ToSyncPath("/"));
            Assert.Equal("orders/42", BundleExporter.ToSyncPath("/orders/42"));
        }

        [Fact]
        public void A_page_renders_untargeted_and_is_its_own_content()
        {
            var entry = CodeExporter().ExportRoute("", "/bundle-hello");
            Assert.True(entry.Ok, entry.SkipReason);
            Assert.Null(entry.ContentJson);
            Assert.Contains("Pre-rendered", entry.Json);
            var wire = JsonNode.Parse(entry.Json!)!;
            Assert.Null(wire["fragments"]![0]!["targetComponentId"]);
        }

        [Fact]
        public void A_route_that_cannot_render_is_skipped_with_its_reason()
        {
            var entry = CodeExporter().ExportRoute("", "/bundle-broken");
            Assert.False(entry.Ok);
            Assert.Contains("needs a database", entry.SkipReason);
        }

        [Fact]
        public void An_identity_dependent_screen_is_kept_backend_served()
        {
            Assert.Contains("[EyesOnly]", BundleExporter.IdentityRestriction(typeof(BundleSecret)));
            Assert.Null(BundleExporter.IdentityRestriction(typeof(BundleHello)));
        }

        [Fact]
        public void A_sub_route_under_a_yaml_shell_ships_the_shell_and_its_content()
        {
            var specs = Specs(new()
            {
                ["app.ui.yaml"] = "type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n",
                ["routes.yaml"] = "routes:\n  - route: \"\"\n    layout: shell.yaml\n  - route: about\n    layout: about.yaml\n",
                ["shell.yaml"] = "type: AppShell\ntitle: S\nmenu:\n  - {type: RouteLink, label: About, route: about}\n",
                ["about.yaml"] = "layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: About page\n",
            });
            var about = YamlExporter(specs).ExportAll("").Entries.Single(e => e.Route == "/about");
            var shell = JsonNode.Parse(about.Json!)!["fragments"]![0]!["component"]!["metadata"]!;
            Assert.Equal("App", shell["type"]!.GetValue<string>());
            Assert.Equal("/about", shell["homeRoute"]!.GetValue<string>());
            Assert.Contains("About page", about.ContentJson);
        }

        [Fact]
        public void Param_routes_are_skipped_unless_bundled_as_templates()
        {
            var specs = Specs(Orders);
            Assert.DoesNotContain(YamlExporter(specs).ExportAll("").Entries, e => e.Route == "/orders/:id");
            var entry = YamlExporter(specs).ExportAll("", includeParamRoutes: true).Entries.Single(e => e.Route == "/orders/:id");
            Assert.True(entry.Ok, entry.SkipReason);
            Assert.Equal("^orders/([^/]+)$", entry.RoutePattern);
            Assert.Equal(["id"], entry.ParamNames!);
            Assert.Equal("orders/:id", entry.SyncPath);
        }

        [Fact]
        public void Specs_mode_ships_the_definition_raw_with_its_partials_inlined()
        {
            var manifest = YamlExporter(Specs(Orders)).ExportAll("", specsOnly: true);
            Assert.DoesNotContain(manifest.Entries, e => e.Route == "/about");
            var content = manifest.Definitions!["about.yaml"]!["layout"]!["content"]!.AsArray();
            Assert.Equal(["One", "Two"], content.Select(c => c!["text"]!.GetValue<string>()));
        }

        [Fact]
        public void Only_the_types_the_expander_knows_are_left_to_the_browser()
        {
            Assert.True(BundleExporter.IsClientExpandable(JsonNode.Parse("{\"type\":\"Listing\"}")!.AsObject()));
            Assert.True(BundleExporter.IsClientExpandable(JsonNode.Parse("{\"layout\":{\"type\":\"VerticalLayout\"}}")!.AsObject()));
            Assert.False(BundleExporter.IsClientExpandable(JsonNode.Parse("{\"type\":\"Wizard\"}")!.AsObject()));
            Assert.False(BundleExporter.IsClientExpandable(null));
        }

        [Fact]
        public void The_manifest_has_java_s_members_in_java_s_order()
        {
            var wire = YamlExporter(Specs(Orders)).ExportAll("").ToWire();
            Assert.Equal(
                ["baseUrl", "generatedAt", "staticOnly", "entries", "routes", "sources", "requiredCapabilities",
                    "definitions", "actions", "translations", "environment", "mockSources"],
                wire.Select(kv => kv.Key));
            Assert.Equal(
                ["route", "syncPath", "json", "ok", "skipReason", "routePattern", "paramNames", "contentJson"],
                wire["entries"]![0]!.AsObject().Select(kv => kv.Key));
        }

        [Fact]
        public void The_structure_hash_ignores_the_build_time_and_the_source_catalogue()
        {
            static BundleManifest Of(string at, string url, string? content = null) =>
                new("", at, true, [new BundleEntry("/x", "x",
                    "{\"fragments\":[{\"component\":{\"metadata\":{\"restSources\":[{\"url\":\"" + url + "\"}]}}}]}",
                    true, ContentJson: content)]);
            Assert.Equal(Of("t1", "https://a").StructureHash(), Of("t2", "https://b").StructureHash());
            Assert.NotEqual(Of("t", "https://a").StructureHash(), Of("t", "https://a", "{}").StructureHash());
        }

        // ── static safety ──────────────────────────────────────────────────────────────────────────

        [Fact]
        public void A_csharp_action_method_needs_a_server_and_a_rest_action_does_not()
        {
            var reasons = StaticSafetyCheck.CheckClass("/a", typeof(BundleServerAction)).Select(v => v.Reason).ToList();
            Assert.Contains(reasons, r => r.Contains("BundleServerAction.Save() is a C# action method"));
            Assert.Empty(StaticSafetyCheck.CheckClass("/b", typeof(BundleRestAction)));
            Assert.Contains(StaticSafetyCheck.CheckClass("/c", typeof(BundleSecret)), v => v.Reason.Contains("[EyesOnly]"));
        }

        [Fact]
        public void A_skipped_route_needs_a_server()
        {
            var manifest = new BundleManifest("", "t", true, [new BundleEntry("/x", "x", null, false, "boom")]);
            Assert.Equal("/x — could not be bundled, so it would be served by a backend: boom",
                StaticSafetyCheck.Check(manifest, new Dictionary<string, Type>()).Single().ToString());
        }

        [Fact]
        public void Proxied_and_secret_sources_need_a_server()
        {
            var catalog = JsonNode.Parse("[{\"name\":\"crm\",\"source\":{\"url\":\"https://crm\",\"proxy\":true}}]")!.AsArray();
            Assert.Contains("server proxy",
                StaticSafetyCheck.CheckSource("/a", JsonNode.Parse("{\"ref\":\"crm\"}")!.AsObject(), catalog, "a source")[0].Reason);
            Assert.Contains("secret",
                StaticSafetyCheck.CheckSource("/a", JsonNode.Parse("{\"url\":\"https://x?k=${secret.K}\"}")!.AsObject(), [], "a source")[0].Reason);
            Assert.Empty(StaticSafetyCheck.CheckSource("/a", JsonNode.Parse("{\"url\":\"https://ok\"}")!.AsObject(), [], "a source"));
        }

        [Fact]
        public void A_definition_naming_a_server_action_needs_a_server()
        {
            var definition = JsonNode.Parse("""
                {"actions":[{"id":"send","restAction":{"source":{"url":"https://x"}}}],
                 "layout":{"type":"VerticalLayout","content":[
                   {"type":"Button","actionId":"send"},{"type":"Button","actionId":"save"},
                   {"type":"Button","actionId":"go","route":"/x"},{"type":"Map","markerActionId":"pick"}]}}
                """)!;
            var reasons = StaticSafetyCheck.CheckDefinition("/p", definition, []).Select(v => v.Reason).ToList();
            Assert.Equal(2, reasons.Count);
            Assert.Contains(reasons, r => r.Contains("button 'save'"));
            Assert.Contains(reasons, r => r.Contains("Map runs action 'pick' (markerActionId)"));
        }

        [Fact]
        public void A_trigger_running_a_server_action_and_a_server_header_action_need_a_server()
        {
            var wire = JsonNode.Parse("{\"triggers\":[{\"type\":\"OnLoad\",\"actionId\":\"load\"}],\"actions\":[{\"id\":\"x\"}]}");
            Assert.Contains("OnLoad trigger runs action 'load'", StaticSafetyCheck.CheckWire("/p", wire, [])[0].Reason);
            var shell = JsonNode.Parse("{\"type\":\"AppShell\",\"headerActions\":[{\"actionId\":\"logout\"},{\"actionId\":\"x\",\"route\":\"/x\"}]}");
            Assert.Contains("header action 'logout'", StaticSafetyCheck.CheckShellHeaderActions("/", shell).Single().Reason);
        }

        // ── the command line and the files ─────────────────────────────────────────────────────────

        [Fact]
        public void The_command_line_writes_a_self_contained_static_site()
        {
            var specs = Specs(Orders);
            var outDir = Path.Combine(Path.GetDirectoryName(specs)!, "dist");
            var code = MateuBundle.Run(["--ui", Renderer, "--specs", specs, "--out", outDir, "--title", "Bundled", "--static", "-q"],
                TextWriter.Null, TextWriter.Null, typeof(Form).Assembly);
            Assert.Equal(0, code);
            var manifest = JsonNode.Parse(File.ReadAllText(Path.Combine(outDir, "manifest.json")))!;
            Assert.Contains(manifest["entries"]!.AsArray(), e => e!["route"]!.GetValue<string>() == "/about");
            var index = File.ReadAllText(Path.Combine(outDir, "index.html"));
            Assert.Contains("bundleUrl=\"/manifest.json\"", index);
            Assert.DoesNotContain("AQUIUI", index);
            Assert.DoesNotContain("AQUIELTITULODELAPAGINA", index);
            Assert.Contains("rel=\"manifest\"", index);
            Assert.True(Directory.Exists(Path.Combine(outDir, "assets")));
            Assert.False(File.Exists(Path.Combine(outDir, "_index.html")));
            Assert.Equal("/*    /index.html    200\n", File.ReadAllText(Path.Combine(outDir, "_redirects")));
            Assert.True(File.Exists(Path.Combine(outDir, "mateu-sw.js")));
            Assert.True(File.Exists(Path.Combine(outDir, "pwa", "manifest.webmanifest")));
            var mobile = JsonNode.Parse(File.ReadAllText(Path.Combine(outDir, "mateu", "v3", "manifest")))!;
            Assert.Equal("manifest.json", mobile["bundle"]!.GetValue<string>());
        }

        [Fact]
        public void The_command_line_fails_a_static_bundle_that_needs_a_server()
        {
            var specs = Specs(new()
            {
                ["routes.yaml"] = "routes:\n  - route: form\n    layout: form.yaml\n",
                ["form.yaml"] = "layout:\n  type: VerticalLayout\n  content:\n    - type: Button\n      label: Save\n      actionId: save\n",
            });
            var err = new StringWriter();
            var args = new[] { "--ui", Renderer, "--specs", specs, "--out", Path.Combine(Path.GetDirectoryName(specs)!, "d"), "-q" };
            Assert.Equal(1, MateuBundle.Run([.. args, "--static"], TextWriter.Null, err, typeof(Form).Assembly));
            Assert.Contains("still need a server", err.ToString());
            Assert.Contains("button 'save'", err.ToString());
            // without --static a hybrid bundle (in front of a backend) builds
            Assert.Equal(0, MateuBundle.Run(args, TextWriter.Null, TextWriter.Null, typeof(Form).Assembly));
        }

        [Fact]
        public void The_command_line_asks_for_a_renderer_and_refuses_unknown_options()
        {
            var err = new StringWriter();
            Assert.Equal(2, MateuBundle.Run(["--ui", "", "--out", "x"], TextWriter.Null, err, typeof(Form).Assembly));
            Assert.Contains("no renderer", err.ToString());
            Assert.Equal(2, MateuBundle.Run(["--nope"], TextWriter.Null, TextWriter.Null, typeof(Form).Assembly));
        }

        [Fact]
        public void The_inliner_splices_partials_inlines_components_and_breaks_cycles()
        {
            var specs = Specs(new()
            {
                ["partials/two.yaml"] = "content:\n  - type: Text\n    text: A\n  - type: Partial\n    ref: one\n",
                ["partials/one.yaml"] = "type: Text\ntext: B\n",
                ["partials/loop.yaml"] = "type: Partial\nref: loop\n",
                ["components.yaml"] = "components:\n  - name: badge\n    component:\n      type: Badge\n      text: New\n  - name: self\n    component:\n      type: ComponentRef\n      ref: self\n",
            });
            var inliner = new DefinitionInliner(specs);
            object Yaml(string text) => new YamlDotNet.Serialization.DeserializerBuilder()
                .WithAttemptingUnquotedStringTypeDeserialization().Build().Deserialize<object>(text)!;
            var tree = YamlTree.ToJson(inliner.Inline(Yaml(
                "type: VerticalLayout\ncontent:\n  - {type: Partial, ref: two}\n  - {type: ComponentRef, ref: badge}\n"
                + "  - {type: ComponentRef, ref: self}\n  - {type: Partial, ref: missing}\n  - {type: Partial, ref: a.B}\n"
                + "slot: {type: Partial, ref: two}\nloop: {type: Partial, ref: loop}\ncolumns: 2\nratio: 1.5\nflag: true\nquoted: \"2\"\n")))!;
            var content = tree["content"]!.AsArray();
            Assert.Equal("A", content[0]!["text"]!.GetValue<string>());
            Assert.Equal("B", content[1]!["text"]!.GetValue<string>());
            Assert.Equal("Badge", content[2]!["type"]!.GetValue<string>());
            // a self-including component and an unknown / class partial stay references
            Assert.Equal("ComponentRef", content[3]!["type"]!.GetValue<string>());
            Assert.Equal("missing", content[4]!["ref"]!.GetValue<string>());
            Assert.Equal("a.B", content[5]!["ref"]!.GetValue<string>());
            // several components in a single slot are stacked
            Assert.Equal("VerticalLayout", tree["slot"]!["type"]!.GetValue<string>());
            Assert.Equal("Partial", tree["loop"]!["type"]!.GetValue<string>());
            // scalars typed as YAML types them; a quoted one stays text
            Assert.Equal("2", tree["columns"]!.ToJsonString());
            Assert.Equal("1.5", tree["ratio"]!.ToJsonString());
            Assert.Equal("true", tree["flag"]!.ToJsonString());
            Assert.Equal("\"2\"", tree["quoted"]!.ToJsonString());
        }

        [Fact]
        public void Access_restricted_routes_and_definitions_stay_backend_served_and_unshipped()
        {
            var specs = Specs(new()
            {
                ["routes.yaml"] = "routes:\n  - route: admin\n    layout: admin.yaml\n    access: admin\n"
                                  + "  - route: mixed\n    layout: mixed.yaml\n",
                ["admin.yaml"] = "layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: Admin\n",
                ["mixed.yaml"] = "layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: Hi\n      eyesOnly: admin\n",
            });
            var exporter = YamlExporter(specs);
            var manifest = exporter.ExportAll("", specsOnly: true);
            Assert.Contains("declares access:", manifest.Entries.Single(e => e.Route == "/admin").SkipReason);
            Assert.Contains("declares access keys", manifest.Entries.Single(e => e.Route == "/mixed").SkipReason);
            Assert.Empty(manifest.Definitions!);
            var reasons = StaticSafetyCheck.Check(manifest, exporter.ClassesByRoute()).Select(v => v.ToString()).ToList();
            Assert.Contains(reasons, r => r.StartsWith("/admin — declares access:"));
        }

        [Fact]
        public void The_command_line_options_reach_the_bundle()
        {
            var specs = Specs(new(Orders)
            {
                ["sources.yaml"] = "sources:\n  - name: countries\n    source:\n      url: https://api.example.com/c\n    sample: [{value: es, label: Spain}]\n",
                ["environments/prod.yaml"] = "type: Environment\nname: prod\nsources:\n  countries:\n    baseUrl: https://prod.example.com\n",
            });
            var outDir = Path.Combine(Path.GetDirectoryName(specs)!, "dist");
            var stdout = new StringWriter();
            var code = MateuBundle.Run(["--ui", Renderer, "--specs", specs, "--out", outDir, "--specs-only", "--mock",
                "--environment", "prod", "--include-param-routes", "--no-pwa", "--base-url", "/app"], stdout, TextWriter.Null,
                typeof(Form).Assembly);
            Assert.Equal(0, code);
            Assert.Contains("specs mode", stdout.ToString());
            var manifest = JsonNode.Parse(File.ReadAllText(Path.Combine(outDir, "manifest.json")))!;
            Assert.True(manifest["mockSources"]!.GetValue<bool>());
            Assert.Equal("prod", manifest["environment"]!.GetValue<string>());
            Assert.Equal("/app", manifest["baseUrl"]!.GetValue<string>());
            Assert.Contains("https://prod.example.com", manifest["sources"]!.ToJsonString());
            // specs mode: the expandable definitions travel raw instead of pre-rendered
            Assert.NotNull(manifest["definitions"]!["order.yaml"]);
            Assert.DoesNotContain(manifest["entries"]!.AsArray(), e => e!["route"]!.GetValue<string>() == "/orders/:id");
            Assert.False(Directory.Exists(Path.Combine(outDir, "pwa")));
            Assert.Contains("bundleUrl=\"/app/manifest.json\"", File.ReadAllText(Path.Combine(outDir, "index.html")));

            // an explicit route list, and the failing gates
            var only = Path.Combine(Path.GetDirectoryName(specs)!, "only");
            Assert.Equal(0, MateuBundle.Run(["--ui", Renderer, "--specs", specs, "--out", only, "--route", "/about", "-q"],
                TextWriter.Null, TextWriter.Null, typeof(Form).Assembly));
            Assert.Single(JsonNode.Parse(File.ReadAllText(Path.Combine(only, "manifest.json")))!["entries"]!.AsArray());
            var err = new StringWriter();
            Assert.Equal(1, MateuBundle.Run(["--ui", Renderer, "--specs", specs, "--out", only, "--route", "/nowhere",
                "--fail-on-skipped", "-q"], TextWriter.Null, err, typeof(Form).Assembly));
            Assert.Contains("could not be bundled", err.ToString());
            Assert.Equal(1, MateuBundle.Run(["--ui", Renderer, "--specs", specs, "--out", only, "--route", "/nowhere",
                "--fail-on-empty", "-q"], TextWriter.Null, TextWriter.Null, typeof(Form).Assembly));
            Assert.Equal(2, MateuBundle.Run(["--ui", Path.Combine(specs, "nothing-here"), "--out", only], TextWriter.Null,
                TextWriter.Null, typeof(Form).Assembly));
            Assert.Equal(2, MateuBundle.Run(["--out"], TextWriter.Null, TextWriter.Null, typeof(Form).Assembly));
            var help = new StringWriter();
            Assert.Equal(0, MateuBundle.Run(["--help"], help, TextWriter.Null, typeof(Form).Assembly));
            Assert.Contains("--specs-only", help.ToString());
        }

        [Fact]
        public void A_renderer_jar_is_unpacked_but_its_template()
        {
            var dir = Path.Combine(Path.GetTempPath(), "mateu-bundle-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(dir);
            var jar = Path.Combine(dir, "mateu-vaadin.jar");
            using (var zip = System.IO.Compression.ZipFile.Open(jar, System.IO.Compression.ZipArchiveMode.Create))
            {
                void Put(string name, string text)
                {
                    using var w = new StreamWriter(zip.CreateEntry(name).Open());
                    w.Write(text);
                }
                Put("static/_index.html", "<html><head></head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>");
                Put("static/assets/app.js", "console.log(1)");
                Put("META-INF/MANIFEST.MF", "x");
            }
            var outDir = Path.Combine(dir, "out");
            BundleWriter.Write(outDir, new BundleManifest("", "t", true, []), RendererFiles.At(jar), "", "T", true, null);
            Assert.True(File.Exists(Path.Combine(outDir, "assets", "app.js")));
            Assert.False(File.Exists(Path.Combine(outDir, "_index.html")));
            Assert.False(Directory.Exists(Path.Combine(outDir, "META-INF")));
            Assert.Contains("<mateu-ui", File.ReadAllText(Path.Combine(outDir, "index.html")));
        }

        [Fact]
        public void Routes_and_their_classes_come_from_the_views_and_the_authored_view_models()
        {
            var specs = Specs(new()
            {
                ["routes.yaml"] = "routes:\n  - route: bound\n    viewModel: Mateu.Tests.Bundle.BundleHello\n"
                                  + "  - route: gone\n    layout: missing.yaml\n  - route: broken\n    layout: broken.yaml\n",
                ["broken.yaml"] = "layout: [unclosed\n",
            });
            var exporter = new BundleExporter(
                new SyncHandler(new MateuRegistry(typeof(BundleHello).Assembly), specsDir: specs), specs);
            Assert.Contains("/bundle-hello", exporter.DeclaredRoutes());
            var classes = exporter.ClassesByRoute();
            Assert.Equal(typeof(BundleHello), classes["bundle-hello"]);
            Assert.Equal(typeof(BundleHello), classes["bound"]);
            // a missing or unreadable definition is left out (logged), never fatal
            var manifest = exporter.Export("", ["/bundle-hello"]);
            Assert.True(manifest.Entries.Single().Ok);
        }

        [Fact]
        public void An_unreadable_answer_is_no_app_shell_and_counts_no_capability()
        {
            Assert.Null(BundleExporter.AppShellConsumedRoute("not json"));
            Assert.Null(BundleExporter.AppShellConsumedRoute("{\"fragments\":[{\"component\":{\"metadata\":{\"type\":\"Page\"}}}]}"));
            Assert.Equal("", BundleExporter.AppShellConsumedRoute("{\"fragments\":[{\"component\":{\"metadata\":{\"type\":\"App\"}}}]}"));
            Assert.Equal(["a"], BundleExporter.AggregateCapabilities([
                new BundleEntry("/x", "x", "{broken", true),
                new BundleEntry("/y", "y", "{\"requiredCapabilities\":[\"a\",\"\"]}", true),
                new BundleEntry("/z", "z", null, false),
            ]));
            Assert.Equal("{broken \"restSources\"", BundleJson.WithoutCatalogue("{broken \"restSources\""));
            Assert.Equal("", BundleJson.WithoutCatalogue(null));
        }

        [Fact]
        public void Eyes_only_members_make_a_screen_identity_dependent()
        {
            Assert.Contains("property 'Salary'", BundleExporter.IdentityRestriction(typeof(BundleSecretField)));
            Assert.Contains("method 'Approve'", BundleExporter.IdentityRestriction(typeof(BundleSecretMethod)));
        }

        [Fact]
        public void Listings_cruds_and_unreadable_entries_need_a_server()
        {
            Assert.Contains(StaticSafetyCheck.CheckClass("/l", typeof(Mateu.Tests.Wire.FilteredBooks)), v => v.Reason.Contains("[RestListing]"));
            Assert.Contains(StaticSafetyCheck.CheckClass("/c", typeof(Mateu.Tests.Wire.ProductsCrud)), v => v.Reason.Contains("Crud"));
            var manifest = new BundleManifest("", "t", true, [new BundleEntry("/x", "x", "{broken", true)],
                Routes: JsonNode.Parse("""
                    [{"route":"r","definition":"d.yaml","access":{"roles":["admin"]},
                      "data":{"url":"https://x","proxy":true}}]
                    """)!.AsArray(),
                Definitions: JsonNode.Parse("{\"d.yaml\":{\"type\":\"Text\",\"eyesOnly\":\"admin\"}}")!.AsObject());
            var reasons = StaticSafetyCheck.Check(manifest, new Dictionary<string, Type>()).Select(v => v.Reason).ToList();
            Assert.Contains(reasons, r => r.StartsWith("its exported JSON could not be read"));
            Assert.Contains(reasons, r => r.StartsWith("declares access:"));
            Assert.Contains(reasons, r => r.Contains("declares access keys"));
            Assert.Contains(reasons, r => r.Contains("the route's data (https://x) is fetched through the server proxy"));
            Assert.Contains("server proxy (proxy: true)",
                StaticSafetyCheck.CheckSource("/a", JsonNode.Parse("{\"proxy\":true}")!.AsObject(), [], "a source")[0].Reason);
        }

        [Fact]
        public void The_inliner_survives_broken_files_and_deep_nesting()
        {
            var specs = Specs(new()
            {
                ["partials/bad.yaml"] = "content: [unclosed\n",
                ["components.yaml"] = "components: [unclosed\n",
            });
            var inliner = new DefinitionInliner(specs);
            var bad = new Dictionary<object, object> { ["type"] = "Partial", ["ref"] = "bad" };
            Assert.Same(bad["ref"], ((IDictionary<object, object>)inliner.Inline(bad)!)["ref"]);
            var unknown = new Dictionary<object, object> { ["type"] = "ComponentRef", ["ref"] = "nope" };
            Assert.Equal("nope", ((IDictionary<object, object>)inliner.Inline(unknown)!)["ref"]);
            // a reference nested deeper than the limit is left as it was
            var deep = Specs(Enumerable.Range(0, 25).ToDictionary(i => $"partials/p{i}.yaml", i => $"type: Partial\nref: p{i + 1}\n"));
            var expanded = new DefinitionInliner(deep).Inline(new Dictionary<object, object> { ["type"] = "Partial", ["ref"] = "p0" });
            Assert.Equal("Partial", ((IDictionary<object, object>)expanded!)["type"]);
            Assert.Null(YamlTree.ToJson(null));
            Assert.Equal("1.5", YamlTree.ToJson(1.5m)!.ToJsonString());
            Assert.Equal("3", YamlTree.ToJson((byte)3)!.ToJsonString());
            Assert.Equal("\"x\"", YamlTree.ToJson('x')!.ToJsonString());
        }

        [Fact]
        public void The_launcher_s_app_option_is_accepted()
        {
            var specs = Specs(Orders);
            Assert.Equal(0, MateuBundle.Run(["--app", "App.dll", "--ui", Renderer, "--specs", specs, "--out",
                Path.Combine(Path.GetDirectoryName(specs)!, "d"), "-q"], TextWriter.Null, TextWriter.Null, typeof(Form).Assembly));
        }

        [Fact]
        public void A_bundle_under_a_path_points_everything_at_it()
        {
            Assert.Equal("/app", BundleWriter.BasePathOf("https://cdn.example.com/app/"));
            Assert.Equal("/app", BundleWriter.BasePathOf("/app"));
            Assert.Equal("", BundleWriter.BasePathOf(""));
            var html = BundleWriter.StampIndex("<head></head><!-- AQUIUI --><x><!-- HASTAAQUIUI -->AQUIELTITULODELAPAGINA", "/app", "T");
            Assert.Contains("bundleUrl=\"/app/manifest.json\"", html);
            Assert.EndsWith("T", html);
        }
    }
}

namespace Mateu.Tests.Bundle
{
    [UI("/bundle-hello")]
    [Title("Bundle hello")]
    public class BundleHello
    {
        public string Greeting { get; set; } = "Pre-rendered";
    }

    [UI("/bundle-secret")]
    [EyesOnly(Roles = ["admin"])]
    public class BundleSecret
    {
        public string Secret { get; set; } = "only for admins";
    }

    public class BundleSecretField
    {
        [EyesOnly(Roles = ["hr"])] public decimal Salary { get; set; }
    }

    public class BundleSecretMethod
    {
        [Button("Approve")]
        [EyesOnly(Roles = ["manager"])]
        public void Approve() { }
    }

    [UI("/bundle-server-action")]
    public class BundleServerAction
    {
        public string Name { get; set; } = "";

        [Button("Save")]
        public void Save() { }
    }

    [UI("/bundle-rest-action")]
    public class BundleRestAction
    {
        public string Name { get; set; } = "";

        [Button("Save")]
        [RestAction("https://api.example.com/save")]
        public void Save() { }
    }

    [UI("/bundle-broken")]
    public class BundleBroken
    {
        public BundleBroken() => throw new InvalidOperationException("needs a database");
    }
}
