using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>The page-header keys on a YAML <c>type: Form</c> node (overline, titlePlaceholder,
/// timestamp, badges, kpis, peerNav, recordSwitcher, banners, fabs) reach the "Form" wire metadata
/// with the PageDto field names — the .NET mirror of Java's YAML header parity.</summary>
public class YamlPageHeaderTests
{
    private static JsonObject FormOf(string route)
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(YamlPageHeaderTests).Assembly));
        var increment = handler.Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        var json = JsonSerializer.SerializeToNode(increment.Fragments![0].Component!, MateuExtensions.Json)!;
        return Find(json) ?? throw new Xunit.Sdk.XunitException($"No Form metadata in {json.ToJsonString()}");
    }

    private static JsonObject? Find(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                if (o["metadata"] is JsonObject m && (string?)m["type"] == "Form") return m;
                foreach (var (_, v) in o)
                    if (Find(v) is { } hit) return hit;
                return null;
            case JsonArray a:
                foreach (var v in a)
                    if (Find(v) is { } hit) return hit;
                return null;
            default:
                return null;
        }
    }

    [Fact]
    public void Every_header_key_reaches_the_wire()
    {
        var form = FormOf("yaml-header-full");
        Assert.Equal("${state.name}", (string?)form["title"]);
        Assert.Equal("Customers", (string?)form["overline"]);
        Assert.Equal("New customer…", (string?)form["titlePlaceholder"]);
        Assert.Equal("Last updated ${state.updatedAt}", (string?)form["timestamp"]);

        var badges = form["badges"]!.AsArray();
        Assert.Equal(2, badges.Count);
        Assert.Equal("${state.status}", (string?)badges[0]!["text"]);
        Assert.Equal("success", (string?)badges[0]!["color"]);
        Assert.Equal("normal", (string?)badges[1]!["color"]);
        Assert.False((bool)badges[0]!["pill"]!);
        Assert.False((bool)badges[0]!["primary"]!);
        Assert.False((bool)badges[0]!["small"]!);

        var kpi = form["kpis"]!.AsArray().Single()!;
        Assert.Equal("Balance", (string?)kpi["title"]);
        Assert.Equal("${state.balance}", (string?)kpi["text"]);

        var peer = form["peerNav"]!;
        Assert.Equal("Previous", (string?)peer["prevLabel"]);
        Assert.Equal("customers/1", (string?)peer["prevRoute"]);
        Assert.Equal("Next", (string?)peer["nextLabel"]);
        Assert.Equal("customers/3", (string?)peer["nextRoute"]);

        var sw = form["switcher"]!;
        Assert.Equal("Customer", (string?)sw["label"]);
        Assert.Equal("${state.id}", (string?)sw["value"]);
        Assert.Equal("object", (string?)sw["type"]);
        Assert.Equal("_switchRecord", (string?)sw["actionId"]);
        Assert.Equal("customers/${state._record}", (string?)sw["route"]);
        Assert.Equal(["Ada", "Grace"], sw["options"]!.AsArray().Select(o => (string?)o!["label"]));
        Assert.Equal(["1", "2"], sw["options"]!.AsArray().Select(o => (string?)o!["value"]));

        var banner = form["banners"]!.AsArray().Single()!;
        Assert.Equal("WARNING", (string?)banner["theme"]);
        Assert.Equal("Overdue", (string?)banner["title"]);
        Assert.Equal("Two invoices are overdue", (string?)banner["description"]);
        Assert.True((bool)banner["hasCloseButton"]!);
        Assert.False((bool)banner["hasIcon"]!);
        Assert.Equal(5, (int)banner["timeoutSeconds"]!);
    }

    [Fact]
    public void Fabs_are_sorted_by_order_and_default_to_primary()
    {
        var fabs = FormOf("yaml-header-full")["fabs"]!.AsArray();
        // order 1 first; the two order-2 FABs keep their declaration order (stable)
        Assert.Equal(["call", "newOrder", "mail"], fabs.Select(f => (string?)f!["actionId"]));
        Assert.Equal(["call", "newOrder", "mail"], fabs.Select(f => (string?)f!["id"]));
        Assert.Equal("secondary", (string?)fabs[0]!["buttonStyle"]);
        Assert.Equal("primary", (string?)fabs[1]!["buttonStyle"]);
        Assert.Equal("New order", (string?)fabs[1]!["label"]);
        Assert.Equal("vaadin:plus", (string?)fabs[1]!["icon"]);
    }

    [Fact]
    public void Absent_header_keys_emit_nothing()
    {
        var form = FormOf("yaml-header-plain");
        Assert.Equal("Plain", (string?)form["title"]);
        Assert.Null(form["overline"]);
        Assert.Null(form["titlePlaceholder"]);
        Assert.Null(form["timestamp"]);
        Assert.Null(form["peerNav"]);
        Assert.False(form.ContainsKey("switcher"));
        foreach (var list in new[] { "badges", "kpis", "banners", "fabs" })
            Assert.Empty(form[list]!.AsArray());
    }

    [Fact]
    public void A_switcher_defaults_to_an_object_switcher_dispatching_switchRecord()
    {
        var sw = FormOf("yaml-header-switcher")["switcher"]!;
        Assert.Equal("object", (string?)sw["type"]);
        Assert.Equal("_switchRecord", (string?)sw["actionId"]);
        Assert.False(sw.AsObject().ContainsKey("route"));
        Assert.Empty(sw["options"]!.AsArray());
        var source = sw["optionsSource"]!;
        Assert.Equal("people", (string?)source["ref"]);
        Assert.Equal("content", (string?)source["itemsPath"]);
        Assert.Equal("id", (string?)source["valuePath"]);
        Assert.Equal("name", (string?)source["labelPath"]);
    }

    [Fact]
    public void The_form_content_travels_as_its_children()
    {
        var page = YamlComponentBuilder.Parse("type: Form\ntitle: T\ncontent:\n  - type: Text\n    text: Hi\n");
        var dto = ComponentMapper.Map(page!);
        Assert.IsType<FormMetadataDto>(dto.Metadata);
        Assert.Single(dto.Children);
    }
}
