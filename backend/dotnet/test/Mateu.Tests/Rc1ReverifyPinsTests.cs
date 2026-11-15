using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// GA review round 2, re-verified on rc.1 and fixed for rc.2: the .NET findings no commit since
// beta.65 addressed (D3, D4, D5, D8, B-2). Each test is the review's own scenario (D8 reworded: see
// its note), plus the write side of D3.

public class RvGridRow
{
    public string Sku { get; set; } = "A";
    [EyesOnly(Roles = ["finance"])] public string Cost { get; set; } = "D3-COST-SECRET";
}

[UI("rv-d3-grid"), Title("Order")]
public class RvD3GridForm
{
    public string Note { get; set; } = "n";
    public List<RvGridRow> Lines { get; set; } = [new()];
}

public class RvLockedLine
{
    public string Id { get; set; } = "";
    public string Note { get; set; } = "";
    [ReadOnlyUnless(Roles = ["finance"])] public double Price { get; set; }
}

[UI("rv-d3-grid-write"), Title("Order")]
public class RvD3GridWriteForm
{
    public List<RvLockedLine> Lines { get; set; } =
        [new() { Id = "l1", Note = "a", Price = 10 }, new() { Id = "l2", Note = "b", Price = 20 }];

    [Button] public Message Check() =>
        new(string.Join(",", Lines.Select(l => $"{l.Id}:{l.Note}:{l.Price}")));
}

[UI("rv-d4-wizard"), Title("Signup")]
public class RvD4Wizard : Wizard
{
    [Step(1)] public string? Name { get; set; } = "Ana";
    [Step(1), EyesOnly(Roles = ["admin"])] public string? Secret { get; set; } = "D4-WIZARD-SECRET";

    public override Message Complete() => new("done");
}

public class RvD5Addr
{
    public string City { get; set; } = "Palma";
    [EyesOnly(Roles = ["finance"])] public string Zip { get; set; } = "D5-ZIP-SECRET";
}

public class RvD5Customer
{
    public string Id { get; set; } = "c1";
    public string Name { get; set; } = "Ana";
    public RvD5Addr Address { get; set; } = new();
}

[UI("rv-d5-customers"), Title("Customers")]
public class RvD5Customers : Crud<RvD5Customer>
{
    public override IEnumerable<RvD5Customer> Fetch(string? search) => [new()];
}

public class RvD5Sale
{
    public string Id { get; set; } = "s1";
    [GroupBy, EyesOnly(Roles = ["finance"])] public string Region { get; set; } = "D5-REGION-SECRET";
    public double Amount { get; set; } = 10;
}

[UI("rv-d5-sales"), Title("Sales")]
public class RvD5Sales : IListing<RvD5Sale>
{
    public ListingData<RvD5Sale> Search(SearchRequest request) => ListingData.From(new List<RvD5Sale> { new() });
}

public class RvD8Service
{
    public string Endpoint { get; set; } = "D8-ENDPOINT-https://real";
}

// D8 — a DESIGN decision (rc.2), the same in the three backends: a SETTABLE class-typed property is
// a nested form (Java: a non-final, non-injected POJO field; Python: a public annotated attribute):
// it is drawn on screen, so its values travel in the state and the client edits them. What a view
// HOLDS (a service, a client) is a get-only property (or a field / non-public member) — never sent,
// never written. And a nested form is bound into a copy the view owns, so a shared default object
// is never written by one caller for every other.
[UI("rv-d8-view"), Title("View")]
public class RvD8View
{
    public static readonly RvD8Service Shared = new();
    public string Name { get; set; } = "x";
    public RvD8Service Service { get; } = Shared;

    [Button] public Message Go() => new($"held {Service.Endpoint}");
}

[UI("rv-d8-form"), Title("Form")]
public class RvD8Form
{
    public static readonly RvD8Service Shared = new();
    public string Name { get; set; } = "x";
    public RvD8Service Service { get; set; } = Shared;

    [Button] public Message Go() => new($"form {Service.Endpoint}");
}

public class Rc1ReverifyPinsTests
{
    private static string Json(object? value) =>
        JsonSerializer.Serialize(value, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(Rc1ReverifyPinsTests).Assembly));

    private static string Load(string route) => Json(Handler().Handle(new RunActionRqDto { Route = route }));

    private static string Search<T>(string route) => Json(Handler().Handle(new RunActionRqDto
    {
        Route = route, ServerSideType = typeof(T).FullName, ActionId = "search",
    }));

    [Fact] // D3: grid-field rows emit every property
    public void An_eyes_only_cell_of_a_grid_field_is_not_sent()
    {
        Assert.DoesNotContain("D3-COST-SECRET", Load("rv-d3-grid"));
    }

    private static UIIncrementDto Act(Type view, string route, string action, Dictionary<string, object?> state) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ServerSideType = view.FullName, ActionId = action, ComponentState = state,
        });

    private static JsonElement J(object v) => JsonSerializer.SerializeToElement(v);

    [Fact] // D3, write side: the list was deserialised whole, a [ReadOnlyUnless] cell written
    public void A_locked_cell_of_a_grid_field_keeps_its_value_when_the_rows_are_posted()
    {
        var rows = J(new object[]
        {
            new { id = "l2", note = "B!", price = 999 },
            new { id = "l1", note = "A!", price = 999 },
            new { id = "l3", note = "new", price = 999 },
        });
        var inc = Act(typeof(RvD3GridWriteForm), "rv-d3-grid-write", "check", new() { ["lines"] = rows });
        // each row laid over the stored row with its id; an added row keeps the type's default
        Assert.Equal("l2:B!:20,l1:A!:10,l3:new:0", Assert.Single(inc.Messages).Text);
    }

    [Fact] // D4: the wizard's initial state carries every property
    public void An_eyes_only_wizard_field_is_not_in_the_initial_state()
    {
        Assert.DoesNotContain("D4-WIZARD-SECRET", Load("rv-d4-wizard"));
    }

    [Fact] // D5: a nested object cell is serialised raw
    public void An_eyes_only_value_inside_a_nested_cell_is_not_sent()
    {
        var answer = Search<RvD5Customers>("rv-d5-customers");
        Assert.Contains("Ana", answer);
        Assert.DoesNotContain("D5-ZIP-SECRET", answer);
    }

    [Fact] // D5: an IListing's groups carry a hidden [GroupBy] column's values
    public void A_hidden_group_by_column_is_not_in_the_groups()
    {
        Assert.DoesNotContain("D5-REGION-SECRET", Search<RvD5Sales>("rv-d5-sales"));
    }

    [Fact] // D8: a helper the view HOLDS (get-only) is neither sent nor written
    public void A_helper_object_property_of_a_view_is_not_sent_as_a_form()
    {
        Assert.DoesNotContain("D8-ENDPOINT", Load("rv-d8-view"));
        var inc = Act(typeof(RvD8View), "rv-d8-view", "go", new()
        {
            ["service"] = J(new { endpoint = "http://evil" }), ["service-endpoint"] = J("http://evil"),
        });
        Assert.Equal("held D8-ENDPOINT-https://real", Assert.Single(inc.Messages).Text);
    }

    [Fact] // D8: a settable one is a nested form, bound into the view's own copy, never the shared default
    public void A_nested_form_is_bound_into_its_own_copy_never_a_shared_default()
    {
        var inc = Act(typeof(RvD8Form), "rv-d8-form", "go", new() { ["service-endpoint"] = J("http://edited") });
        Assert.Equal("form http://edited", Assert.Single(inc.Messages).Text);
        Assert.Equal("D8-ENDPOINT-https://real", RvD8Form.Shared.Endpoint);
    }

    [Fact] // B-2: the nupkgs carry LICENSE + NOTICE like every other artifact
    public void The_packages_pack_the_licence_notices()
    {
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../"));
        var props = File.ReadAllText(Path.Combine(root, "Directory.Build.props"));
        Assert.Contains("LICENSE.txt", props);
        Assert.Contains("NOTICE", props.Replace("LICENSE.txt / NOTICE", ""));
        // the files it packs exist where it points (the repository root)
        Assert.True(File.Exists(Path.Combine(root, "../../LICENSE.txt")));
        Assert.True(File.Exists(Path.Combine(root, "../../NOTICE")));
    }
}
