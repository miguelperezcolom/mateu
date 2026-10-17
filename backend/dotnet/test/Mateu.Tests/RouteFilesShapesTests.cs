using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// Route files in the shapes users actually write them: a bare list, a mount listing a single
/// file as a string, inline <c>data:</c> endpoints, snake_case keys, a broken file next to good
/// ones; code-supplied children; and the access walk over nested routes.
/// </summary>
public class RouteFilesShapesTests : IDisposable
{
    private readonly string _dir = Directory.CreateTempSubdirectory("mateu-routes-").FullName;

    public void Dispose() => Directory.Delete(_dir, true);

    private void Write(string file, string content)
    {
        var path = Path.Combine(_dir, file);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, content);
    }

    [Fact]
    public void A_mount_may_list_one_route_file_as_a_string_holding_a_bare_list()
    {
        Write("shop.yaml", """
            type: UI
            basePath: /shop
            routes: shop-routes.yaml
            """);
        Write("shop-routes.yaml", """
            - route: ""
              layout: shop-home.yaml
            - route: orders
              view_model: Acme.Orders
              fixed_params: { status: open }
              default_params: { page: 1 }
              app_state: { tenant: acme }
            """);
        var registry = new RouteRegistry(_dir);
        var orders = registry.Match("/shop/orders")!.Entry;
        Assert.Equal("Acme.Orders", orders.ViewModel);
        Assert.Equal("open", orders.FixedParams["status"]);
        Assert.Equal("1", orders.DefaultParams["page"]?.ToString());
        Assert.Equal("acme", orders.AppState!["tenant"]);
        var app = Assert.Single(registry.Apps());
        Assert.Equal("shop", app.Route);
        Assert.True(app.IsDsl());
        Assert.Equal("shop-home.yaml", app.Definition);
    }

    [Fact]
    public void A_route_may_name_its_data_inline_or_by_reference()
    {
        Write("routes.yaml", """
            routes:
              - route: people
                data:
                  url: /api/people
                  method: POST
                  body: "{}"
                  items_path: content
                  value_path: id
                  label_path: name
                  proxy: true
              - route: countries
                data: " countries "
                appData:
                  ref: settings
              - route: blank
                data: "  "
                app_data: [not, a, source]
            """);
        var registry = new RouteRegistry(_dir);
        var people = registry.Match("people")!.Entry.Data!;
        Assert.Equal("/api/people", people.Url);
        Assert.Equal("POST", people.Method);
        Assert.Equal("{}", people.Body);
        Assert.Equal("content", people.ItemsPath);
        Assert.Equal("id", people.ValuePath);
        Assert.Equal("name", people.LabelPath);
        Assert.True(people.Proxy);
        Assert.Null(people.Ref);
        var countries = registry.Match("countries")!.Entry;
        Assert.Equal("countries", countries.Data!.Ref);
        Assert.Equal("settings", countries.AppData!.Ref);
        Assert.Null(registry.Match("blank")!.Entry.Data);
        Assert.Null(registry.Match("blank")!.Entry.AppData);
    }

    [Fact]
    public void A_broken_route_file_is_skipped_and_the_others_still_serve()
    {
        Write("routes.yaml", "routes:\n  - route: good\n    viewModel: Acme.Good\n");
        Write("extra.yaml", "type: Routes\nroutes: [unclosed\n");
        Write("more.yaml", "type: Routes\nroutes:\n  - route: more\n    viewModel: Acme.More\n");
        Write("notes.yaml", "{ this: is: not yaml");
        Write("scalar.yaml", "just text");
        var registry = new RouteRegistry(_dir);
        Assert.Equal("Acme.Good", registry.Match("good")!.Entry.ViewModel);
        Assert.Equal("Acme.More", registry.Match("more")!.Entry.ViewModel);
    }

    [Fact]
    public void A_broken_mount_descriptor_or_route_file_does_not_hide_the_other_apps()
    {
        Write("good.yaml", "type: UI\nbasePath: good\nroutes: [good-routes.yaml, missing.yaml]\n");
        Write("good-routes.yaml", "- route: \"\"\n  layout: good-home.yaml\n");
        Write("other.yaml", "type: UI\nbasePath: other\nroutes:\n  - other-broken.yaml\n  - other-routes.yaml\n");
        Write("other-broken.yaml", "- route: [unclosed\n");
        Write("other-routes.yaml", "routes:\n  - route: \"\"\n    layout: other-home.yaml\n");
        Write("scalar-routes.yaml", "42");
        Write("third.yaml", "type: UI\nbasePath: third\nroutes: [scalar-routes.yaml]\n");
        var apps = new RouteRegistry(_dir).Apps().ToDictionary(a => a.Route);
        Assert.Equal("good-home.yaml", apps["good"].Definition);
        Assert.Equal("other-home.yaml", apps["other"].Definition);
        Assert.Null(apps["third"].Definition);
    }

    [Fact]
    public void Code_supplied_children_nest_under_their_parent()
    {
        var flat = RouteRegistry.Flatten([
            RouteEntry.Of("/admin", "Acme.Admin") with
            {
                Children = [RouteEntry.Of("users", "Acme.Users") with { Children = [RouteEntry.Of("", "Acme.UsersHome")] }],
            },
        ]);
        Assert.Equal(["admin", "admin/users", "admin/users"], flat.Select(e => e.Route).ToArray());
        Assert.Equal(new string?[] { null, "admin", "admin/users" }, flat.Select(e => e.Parent).ToList());
        Assert.All(flat, e => Assert.Null(e.Children));
    }

    [Fact]
    public void A_restricted_parent_refuses_its_nested_routes_and_their_sub_paths()
    {
        Write("routes.yaml", """
            routes:
              - route: admin
                viewModel: Acme.Admin
                access: { roles: [admin] }
                children:
                  - route: users
                    viewModel: Acme.Users
              - route: public
                viewModel: Acme.Public
            """);
        var registry = new RouteRegistry(_dir);
        bool Staff(Access? a) => a is null || a.RolesOrEmpty.Contains("staff");
        Assert.Equal("admin", registry.RefusingEntry("/admin/users/new?x=1", Staff)!.Route);
        Assert.False(registry.IsReachable("admin/users", Staff));
        Assert.True(registry.IsReachable("public", Staff));
        Assert.True(registry.IsReachable("nowhere/at/all", Staff));
        Assert.True(registry.IsReachable("admin", a => true));
    }

    [Fact]
    public void Without_restricted_routes_everything_is_reachable()
    {
        Write("routes.yaml", "- route: open\n  viewModel: Acme.Open\n");
        Assert.True(new RouteRegistry(_dir).IsReachable("open", _ => false));
    }
}
