using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The remote screen an embedded block shows: a page (it names the window) with an action
/// that answers a message.</summary>
[UI("emb-remote-tools"), Title("Remote tools")]
public class EmbRemoteTools
{
    public string? Name { get; set; } = "Ada";

    [Button] public Message Ping() => new("pong");
}

/// <summary>The host page: one block per chrome, and a top-level one.</summary>
[UI("emb-host-tools"), Title("Host tools")]
public class EmbHostTools : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content =
        [
            .. Enum.GetValues<EmbeddedChrome>().Select(chrome => (IComponent)new MicroFrontend("", "/emb-remote-tools")
                { ServerSideType = typeof(EmbRemoteTools).FullName, Chrome = chrome }),
            new MicroFrontend("", "/emb-remote-tools") { ServerSideType = typeof(EmbRemoteTools).FullName },
        ],
    };
}

/// <summary>A micro frontend EMBEDDED in a page (<c>MicroFrontend.Chrome</c>) is a block of that
/// page, not a page of its own: its chrome travels on the wire, every request it sends says so
/// (<c>RunActionRqDto.EmbeddedChrome</c>) and no answer to it names or moves the window. (Mirrors
/// Java's EmbeddedMicroFrontendSyncTest.)</summary>
public class EmbeddedMicroFrontendTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(EmbeddedMicroFrontendTests).Assembly));

    private static UIIncrementDto Load(string? chrome) => Handler.Handle(new RunActionRqDto
    {
        Route = "/emb-remote-tools", ConsumedRoute = "_empty", ActionId = "", EmbeddedChrome = chrome,
    });

    [Fact]
    public void A_top_level_load_still_names_the_window()
    {
        Assert.Contains(Load(null).Commands, c => c.Type == "SetWindowTitle");
    }

    [Theory]
    [InlineData("NONE")]
    [InlineData("COMPACT")]
    [InlineData("PAGE")]
    public void An_embedded_load_sends_no_window_commands_whatever_the_chrome(string chrome)
    {
        var increment = Load(chrome);
        Assert.DoesNotContain(increment.Commands, c => EmbeddedWindowCommands.WindowCommands.Contains(c.Type));
        Assert.NotEmpty(increment.Fragments); // the content still arrives
    }

    [Fact]
    public void An_embedded_action_keeps_its_effects()
    {
        var increment = Handler.Handle(new RunActionRqDto
        {
            Route = "/emb-remote-tools", ConsumedRoute = "/emb-remote-tools", ActionId = "ping",
            ServerSideType = typeof(EmbRemoteTools).FullName, EmbeddedChrome = "COMPACT",
        });
        Assert.Equal("pong", Assert.Single(increment.Messages).Text);
    }

    [Fact]
    public void Only_the_window_commands_are_stripped()
    {
        var increment = UIIncrementDto.Of(commands:
        [
            new UICommandDto("x", "SetWindowTitle", "t"), new UICommandDto("x", "SetFavicon", "f"),
            new UICommandDto("x", "PushStateToHistory", "/r"), new UICommandDto("x", "DispatchEvent", null),
        ]);
        Assert.Equal(4, EmbeddedWindowCommands.Strip(increment, new RunActionRqDto()).Commands.Count);
        Assert.Equal(["DispatchEvent"],
            EmbeddedWindowCommands.Strip(increment, new RunActionRqDto { EmbeddedChrome = "NONE" }).Commands.Select(c => c.Type));
        // blank = top level
        Assert.Equal(4, EmbeddedWindowCommands.Strip(increment, new RunActionRqDto { EmbeddedChrome = " " }).Commands.Count);
    }

    [Fact]
    public void The_chrome_travels_on_the_wire_only_when_set()
    {
        var json = JsonSerializer.Serialize(Handler.Handle(new RunActionRqDto { Route = "/emb-host-tools" }), Json);
        var chromes = Descendants(JsonNode.Parse(json))
            .Where(o => (string?)o["type"] == "MicroFrontend")
            .Select(o => o.ContainsKey("chrome") ? (string?)o["chrome"] : null)
            .ToList();
        Assert.Equal(["NONE", "COMPACT", "PAGE", null], chromes);
    }

    [Fact]
    public void An_older_request_without_the_marker_is_top_level()
    {
        var rq = JsonSerializer.Deserialize<RunActionRqDto>("{\"route\":\"/emb-remote-tools\",\"actionId\":\"\"}", Json)!;
        Assert.False(rq.Embedded);
        var embedded = JsonSerializer.Deserialize<RunActionRqDto>(
            "{\"route\":\"/emb-remote-tools\",\"embeddedChrome\":\"PAGE\"}", Json)!;
        Assert.True(embedded.Embedded);
        Assert.DoesNotContain("embedded\"", JsonSerializer.Serialize(embedded, Json));
    }

    private static IEnumerable<JsonObject> Descendants(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                yield return o;
                foreach (var (_, v) in o)
                foreach (var x in Descendants(v)) yield return x;
                break;
            case JsonArray a:
                foreach (var v in a)
                foreach (var x in Descendants(v)) yield return x;
                break;
        }
    }
}
