using System.Text.Json.Nodes;
using Mateu.AspNetCore.Testing;
using Xunit;

namespace Mateu.Tests;

/// <summary>The harness's client against wire shapes a .NET backend does not send but a renderer
/// handles (a Java backend's crud orchestrator routes, a component announced and loaded on its own,
/// app state…): a scripted server answers, and the test reads what the harness sent back.</summary>
public class MateuScreenWireTests
{
    private readonly List<JsonObject> _sent = [];

    private MateuTest Serve(Func<JsonObject, JsonObject> answer) =>
        new((rq, _) =>
        {
            _sent.Add((JsonObject)rq.DeepClone());
            return answer(rq);
        });

    private static JsonObject Answer(params JsonObject[] fragments) =>
        new() { ["fragments"] = new JsonArray(fragments.Select(f => (JsonNode)f).ToArray()) };

    private static JsonObject Fragment(JsonObject? component = null, JsonObject? state = null, JsonObject? data = null) =>
        new() { ["component"] = component, ["state"] = state, ["data"] = data };

    private static JsonObject ServerSide(string id, string type, string route, JsonArray children,
        JsonObject? initialData = null, JsonArray? actions = null, JsonArray? triggers = null) => new()
    {
        ["type"] = "ServerSide", ["id"] = id, ["serverSideType"] = type, ["route"] = route,
        ["children"] = children, ["initialData"] = initialData, ["actions"] = actions ?? new JsonArray(),
        ["triggers"] = triggers ?? new JsonArray(),
    };

    private static JsonObject Mediator(string route, string type) => new()
    {
        ["type"] = "ClientSide",
        ["metadata"] = new JsonObject
        {
            ["type"] = "App", ["variant"] = "MEDIATOR", ["homeRoute"] = route, ["homeConsumedRoute"] = route,
            ["homeServerSideType"] = type,
        },
    };

    private static string Route(JsonObject rq) => rq["route"]?.GetValue<string>() ?? "";

    private static string ActionOf(JsonObject rq) => rq["actionId"]?.GetValue<string>() ?? "";

    private static string TypeOf(JsonObject rq) => rq["serverSideType"]?.GetValue<string>() ?? "";

    /// <summary>A Java crud: a chrome-less shell → its listing (rows under another data key, a
    /// legacy toolbar node) → New moves the crud to its /new route, whose Save goes to the crud.</summary>
    private JsonObject JavaCrud(JsonObject rq)
    {
        var route = Route(rq);
        var action = ActionOf(rq);
        if (TypeOf(rq) == "" && route == "/crud")
            return Answer(Fragment(ServerSide("crud", "Crud", "/crud", [Mediator("/crud", "Crud")],
                new JsonObject { ["_componentRoute"] = "/crud" })));
        if (route == "/crud" && action == "")
            return Answer(Fragment(ServerSide("crud", "Crud", "/crud",
                [new JsonObject
                {
                    ["type"] = "ClientSide", ["id"] = "listing",
                    ["metadata"] = new JsonObject
                    {
                        ["type"] = "Crud", ["rowRoute"] = "/crud/${row.id}",
                        ["toolbar"] = new JsonArray(new JsonObject { ["actionId"] = "new", ["label"] = "New" }),
                    },
                }],
                new JsonObject { ["_componentRoute"] = "/crud" },
                [new JsonObject { ["id"] = "search" }, new JsonObject { ["id"] = "new" }],
                [new JsonObject { ["type"] = "OnLoad", ["actionId"] = "search" },
                 new JsonObject { ["type"] = "OnLoad", ["actionId"] = "poll", ["timeoutMillis"] = 5000 },
                 new JsonObject { ["type"] = "OnLoad" }])));
        if (action == "search")
            return Answer(Fragment(data: new JsonObject
            {
                ["rows"] = new JsonObject
                {
                    ["page"] = new JsonObject
                    {
                        ["content"] = new JsonArray(new JsonObject { ["id"] = "7", ["name"] = "Seven" }),
                        ["totalElements"] = 1,
                    },
                },
            }));
        if (action == "new")
            return Answer(Fragment(state: new JsonObject { ["_route"] = "/new", ["_componentRoute"] = "/crud" }));
        if (route == "/crud/new" && action == "")
            return Answer(Fragment(ServerSide("form", "CrudForm", "/crud/new",
                [new JsonObject { ["type"] = "FormField", ["fieldId"] = "name", ["label"] = "Name" }],
                actions: [new JsonObject { ["id"] = "cancel" }])));
        if (action == "save")
            return Answer(Fragment(state: new JsonObject { ["_route"] = "list", ["_componentRoute"] = "/crud" }));
        if (route == "/crud/7")
            return Answer(Fragment(ServerSide("view", "CrudView", "/crud/7",
                [new JsonObject { ["type"] = "Text", ["text"] = "Record seven" }])));
        return new JsonObject();
    }

    [Fact]
    public void A_java_crud_moves_between_its_routes()
    {
        using var mateu = Serve(JavaCrud);
        var screen = mateu.Open("/crud");
        Assert.Equal("Seven", screen.Listing().Row(0)["name"]);
        Assert.Equal(1, screen.Listing().Total);
        Assert.DoesNotContain(_sent, rq => ActionOf(rq) == "poll");

        screen.Button("New").Press();
        Assert.Equal("/crud/new", screen.Route);
        screen.Field("name").Set("Eight");
        screen.Run("save");
        // the form does not own save: it goes to the crud orchestrator
        var save = _sent.Single(rq => ActionOf(rq) == "save");
        Assert.Equal("Crud", TypeOf(save));
        Assert.Equal("Eight", save["componentState"]?["name"]?.GetValue<string>());
        Assert.Equal("/crud", screen.Route);

        screen.Listing().Row("Seven").Open();
        Assert.Equal("/crud/7", screen.Route);
        Assert.True(screen.Shows("Record seven"));
    }

    [Fact]
    public void Announced_components_app_state_and_plain_fragments()
    {
        using var mateu = Serve(rq => (Route(rq), ActionOf(rq), TypeOf(rq)) switch
        {
            ("/announced", "", "") => Answer(Fragment(ServerSide("late", "Late", "/late", []))),
            ("/late", "", "Late") => new JsonObject
            {
                ["fragments"] = new JsonArray(Fragment(ServerSide("late", "Late", "/late",
                    [new JsonObject { ["type"] = "Text", ["text"] = "Loaded late" }],
                    actions: [new JsonObject { ["id"] = "touch" }]))),
                ["appState"] = new JsonObject { ["tenant"] = "acme" },
            },
            ("/late", "touch", _) => Answer(Fragment(state: new JsonObject { ["touched"] = true })),
            ("/plain", "", "") => Answer(Fragment(new JsonObject
            {
                ["type"] = "ClientSide", ["metadata"] = new JsonObject { ["type"] = "Text" }, ["text"] = "Just text",
            }, new JsonObject { ["seen"] = 1 })),
            _ => new JsonObject(),
        });
        var screen = mateu.Open("/announced");
        Assert.True(screen.Shows("Loaded late"));
        screen.Run("touch");
        Assert.Equal("acme", _sent[^1]["appState"]?["tenant"]?.GetValue<string>());
        Assert.True(screen.State["touched"]!.GetValue<bool>());
        var plain = mateu.Open("/plain");
        Assert.True(plain.Shows("Just text"));
        Assert.Equal(1, plain.State["seen"]!.GetValue<int>());
    }

    [Fact]
    public void An_action_an_overlay_does_not_own_goes_to_its_opener()
    {
        using var mateu = Serve(rq => (Route(rq), ActionOf(rq)) switch
        {
            ("/host", "") => Answer(Fragment(ServerSide("host", "Host", "/host",
                [new JsonObject { ["type"] = "Button", ["label"] = "Open", ["actionId"] = "open" }],
                actions: [new JsonObject { ["id"] = "open" }, new JsonObject { ["id"] = "pick*" }]))),
            ("/host", "open") => Answer(new JsonObject
            {
                ["action"] = "Add",
                ["component"] = new JsonObject
                {
                    ["type"] = "ClientSide",
                    ["metadata"] = new JsonObject { ["type"] = "Dialog", ["headerTitle"] = "Pick", ["initialData"] = new JsonObject { ["q"] = "x" } },
                },
            }),
            ("/host", "elsewhere") => new JsonObject
            {
                ["commands"] = new JsonArray(new JsonObject { ["type"] = "CloseModal" },
                    new JsonObject { ["type"] = "RunAction", ["data"] = "pick-one" }),
            },
            _ => new JsonObject(),
        });
        var screen = mateu.Open("/host").Button("Open").Press();
        Assert.Equal("Pick", screen.OverlayTitle);
        Assert.Equal("x", screen.State["q"]!.GetValue<string>());
        screen.Run("elsewhere");
        Assert.Equal("Host", TypeOf(_sent.Single(rq => ActionOf(rq) == "elsewhere")));
        Assert.False(screen.HasOverlay);
        Assert.Contains(_sent, rq => ActionOf(rq) == "pick-one");
    }

    [Fact]
    public void A_shell_that_keeps_redirecting_fails()
    {
        using var mateu = Serve(_ => Answer(Fragment(new JsonObject
        {
            ["type"] = "ClientSide",
            ["metadata"] = new JsonObject { ["type"] = "App", ["homeRoute"] = "/again", ["serverSideType"] = "Shell" },
        })));
        Assert.Throws<MateuTestException>(() => mateu.Open("/again"));
        using var empty = Serve(_ => Answer(Fragment(new JsonObject
        {
            ["type"] = "ClientSide", ["metadata"] = new JsonObject { ["type"] = "App", ["title"] = "Bare" },
        })));
        Assert.Empty(empty.Open("/").Menu); // a shell with no home stays where it is
    }

    [Fact]
    public void Unopenable_rows_and_empty_listings_say_so()
    {
        using var mateu = Serve(_ => Answer(Fragment(ServerSide("l", "L", "/l",
            [new JsonObject { ["type"] = "ClientSide", ["id"] = "rows", ["metadata"] = new JsonObject { ["type"] = "Crud" } }],
            new JsonObject(), triggers: [new JsonObject { ["type"] = "OnValueChange", ["actionId"] = "x" }]))));
        var listing = mateu.Open("/l").Listing();
        Assert.Empty(listing.Rows);
        Assert.Equal(0, listing.Total);
        Assert.Empty(listing.Columns);
    }
}
