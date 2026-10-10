using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// The YAML access keys — the data twin of [EyesOnly]/[ReadOnlyUnless]/[DisabledUnless], decided on
/// the SERVER from the request identity. Mirrors Java's YamlAccessSyncTest: a route's <c>access:</c>
/// answers 403 (its nested routes too), <c>eyesOnly:</c> hides, <c>readOnlyUnless:</c> locks,
/// <c>disabledUnless:</c> disables, a declared action's <c>access:</c> is refused when invoked and
/// disables the buttons naming it. (The .NET port has no <c>type: AppShell</c> definitions, so the
/// menu-item <c>access:</c> is pinned at the YamlAccess level only.)
/// </summary>
public class YamlAccessTests
{
    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-access-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: sec-admin
                definition: admin.yaml
                access: {roles: [admin]}
                children:
                  - route: users
                    definition: admin.yaml
              - route: sec-page
                definition: page.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "admin.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - type: Text
                  text: Admin area
            """);
        File.WriteAllText(Path.Combine(dir, "page.yaml"), """
            actions:
              - id: purge
                access: {roles: [manager]}
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: salary
                  dataType: number
                  readOnlyUnless: {roles: [hr]}
                - type: FormField
                  id: secretNotes
                  dataType: string
                  eyesOnly: admin
                - type: Button
                  label: Delete
                  actionId: delete
                  disabledUnless: {roles: [manager]}
                - type: Button
                  label: Purge
                  actionId: purge
            """);
        return dir;
    }

    private static readonly string Dir = Specs();

    private static SyncHandler Handler(params string[] roles) =>
        new(new MateuRegistry(typeof(Access).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            specsDir: Dir);

    private static string Json(UIIncrementDto increment) =>
        JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    /// <summary>Every component metadata object of the increment, by its id (FormField fieldId / Button actionId).</summary>
    private static Dictionary<string, JsonElement> ById(UIIncrementDto increment)
    {
        var found = new Dictionary<string, JsonElement>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("fieldId", out var f) && f.ValueKind == JsonValueKind.String) found[f.GetString()!] = e;
                else if (e.TryGetProperty("actionId", out var a) && a.ValueKind == JsonValueKind.String
                         && e.TryGetProperty("label", out _)) found[a.GetString()!] = e;
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array)
                foreach (var i in e.EnumerateArray()) Walk(i);
        }
        Walk(JsonDocument.Parse(Json(increment)).RootElement);
        return found;
    }

    [Fact]
    public void A_route_declaring_access_is_refused_to_an_unauthorized_caller()
    {
        Assert.Throws<MateuForbiddenException>(() => Handler().Handle(new RunActionRqDto { Route = "/sec-admin" }));
        Assert.Throws<MateuForbiddenException>(() => Handler("hr").Handle(new RunActionRqDto { Route = "/sec-admin" }));
        Assert.Contains("Admin area", Json(Handler("admin").Handle(new RunActionRqDto { Route = "/sec-admin" })));
    }

    [Fact]
    public void A_route_nested_under_a_restricted_one_inherits_its_access()
    {
        Assert.Throws<MateuForbiddenException>(() => Handler().Handle(new RunActionRqDto { Route = "/sec-admin/users" }));
        Assert.Contains("Admin area", Json(Handler("admin").Handle(new RunActionRqDto { Route = "/sec-admin/users" })));
    }

    [Fact]
    public void Components_are_hidden_locked_and_disabled_for_an_unauthorized_caller()
    {
        var byId = ById(Handler().Handle(new RunActionRqDto { Route = "/sec-page" }));
        Assert.False(byId.ContainsKey("secretNotes"));
        Assert.True(byId["salary"].GetProperty("readOnly").GetBoolean());
        Assert.True(byId["delete"].GetProperty("disabled").GetBoolean());
        // a button naming a declared action the caller may not run is disabled too
        Assert.True(byId["purge"].GetProperty("disabled").GetBoolean());
    }

    [Fact]
    public void Components_are_shown_and_enabled_for_an_authorized_caller()
    {
        var byId = ById(Handler("hr", "admin", "manager").Handle(new RunActionRqDto { Route = "/sec-page" }));
        Assert.True(byId.ContainsKey("secretNotes"));
        Assert.False(byId["salary"].GetProperty("readOnly").GetBoolean());
        Assert.False(byId["delete"].GetProperty("disabled").GetBoolean());
        Assert.False(byId["purge"].GetProperty("disabled").GetBoolean());
    }

    [Fact]
    public void A_declared_action_is_refused_when_it_reaches_the_server_anyway()
    {
        Assert.Throws<MateuForbiddenException>(() =>
            Handler("hr").Handle(new RunActionRqDto { Route = "/sec-page", ActionId = "purge" }));
        // the proxied leg names the action as the source id
        Assert.Throws<MateuForbiddenException>(() => Handler("hr").Handle(new RunActionRqDto
        {
            Route = "/sec-page", ActionId = "__restfetch__",
            Parameters = new() { ["_sourceKind"] = "ACTION", ["_sourceId"] = "purge" },
        }));
    }

    [Fact]
    public void Locked_fields_are_reported_so_their_client_values_are_dropped()
    {
        var loader = new YamlSpecLoader(Dir);
        var spec = loader.LoadSpec("sec-page", _ => false, null)!;
        Assert.Contains("salary", spec.LockedFields);
        Assert.Contains("secretNotes", spec.LockedFields);
        Assert.Contains("purge", spec.RefusedActions);
        var granted = loader.LoadSpec("sec-page", _ => true, null)!;
        Assert.Empty(granted.LockedFields);
        Assert.Empty(granted.RefusedActions);
    }

    [Fact]
    public void Menu_items_are_hidden_and_a_route_link_inherits_its_routes_access()
    {
        var tree = YamlComponentBuilder.Deserialize("""
            menu:
              - {type: RouteLink, label: Users, route: admin/users}
              - {type: RouteLink, label: Reports, route: reports, access: {roles: [boss]}}
              - type: Menu
                label: Tools
                submenu:
                  - {type: RouteLink, label: Purge, route: tools/purge, access: [boss]}
              - {type: RouteLink, label: Home, route: home}
            """);
        var applied = YamlAccess.Apply(tree, a => a is null, route => route != "admin/users");
        var menu = (List<object?>)((IDictionary<object, object>)applied.Tree!)["menu"];
        Assert.Single(menu);
        Assert.Equal("Home", ((IDictionary<object, object>)menu[0]!)["label"]);
        // nothing restricted: everything stays, and the keys are stripped
        Assert.False(YamlAccess.DeclaresAccess(YamlAccess.Apply(tree, _ => true).Tree));
    }

    [Fact]
    public void The_access_shorthands_parse_as_roles()
    {
        Assert.Equal(["admin"], YamlAccess.AccessOf("admin")!.Roles);
        Assert.Equal(["a", "b"], YamlAccess.AccessOf(new List<object> { "a", "b" })!.Roles);
        Assert.Null(YamlAccess.AccessOf(new Dictionary<object, object>()));
    }

    // ── the action catalogue's access: (actions.yaml / type: Actions) ───────────────────────

    private static readonly ActionCatalog RestrictedCatalog = new(
    [
        new CatalogAction("wipe") { Steps = [new Navigate("wiped")], Access = Access.OfRoles("manager") },
        new CatalogAction("newOrder") { Steps = [new Navigate("orders/new")], Access = Access.OfRoles("manager") },
        new CatalogAction("open") { Steps = [new Navigate("opened")] },
    ]);

    private static readonly string CatalogueDir = CatalogueSpecs();

    private static string CatalogueSpecs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-access-catalogue-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: sec-catalogue
                definition: page.yaml
              - route: sec-owner
                definition: owner.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "page.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - type: Button
                  label: Wipe
                  actionId: wipe
                - type: Button
                  label: Open
                  actionId: open
            """);
        // OWNER FIRST: a page that declares its own `wipe` is the page's, never the catalogue's
        File.WriteAllText(Path.Combine(dir, "owner.yaml"), """
            actions:
              - id: wipe
                steps:
                  - type: Navigate
                    route: own
            layout:
              type: VerticalLayout
              content:
                - type: Button
                  label: Wipe
                  actionId: wipe
            """);
        return dir;
    }

    private static SyncHandler CatalogueHandler(params string[] roles) =>
        new(new MateuRegistry(typeof(CataloguePage).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            specsDir: CatalogueDir, actionCatalog: new ActionRegistry(RestrictedCatalog));

    [Fact]
    public void A_restricted_catalogue_action_is_refused_like_a_page_action()
    {
        var refused = ById(CatalogueHandler("hr").Handle(new RunActionRqDto { Route = "/sec-catalogue" }));
        Assert.True(refused["wipe"].GetProperty("disabled").GetBoolean());
        Assert.False(refused["open"].GetProperty("disabled").GetBoolean());
        Assert.Throws<MateuForbiddenException>(() =>
            CatalogueHandler("hr").Handle(new RunActionRqDto { Route = "/sec-catalogue", ActionId = "wipe" }));
        Assert.Throws<MateuForbiddenException>(() => CatalogueHandler("hr").Handle(new RunActionRqDto
        {
            Route = "/sec-catalogue", ActionId = "__restfetch__",
            Parameters = new() { ["_sourceKind"] = "ACTION", ["_sourceId"] = "wipe" },
        }));
        // the page's own action of the same id is the page's: not refused
        Assert.False(ById(CatalogueHandler("hr").Handle(new RunActionRqDto { Route = "/sec-owner" }))["wipe"]
            .GetProperty("disabled").GetBoolean());
        CatalogueHandler("hr").Handle(new RunActionRqDto { Route = "/sec-owner", ActionId = "wipe" });
    }

    [Fact]
    public void A_restricted_catalogue_action_is_granted_to_an_authorized_caller()
    {
        var granted = ById(CatalogueHandler("manager").Handle(new RunActionRqDto { Route = "/sec-catalogue" }));
        Assert.False(granted["wipe"].GetProperty("disabled").GetBoolean());
        CatalogueHandler("manager").Handle(new RunActionRqDto { Route = "/sec-catalogue", ActionId = "wipe" });
    }

    [Fact]
    public void The_catalogue_on_the_wire_excludes_the_entries_the_caller_may_not_run()
    {
        string App(params string[] roles) => Json(CatalogueHandler(roles).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }));
        Assert.DoesNotContain("\"id\":\"wipe\"", App("hr"));
        Assert.Contains("\"id\":\"open\"", App("hr"));
        Assert.Contains("\"id\":\"wipe\"", App("manager"));

        // a page naming a refused entry does not get it shipped either
        List<string> PageActions(params string[] roles) => CatalogueHandler(roles)
            .Handle(new RunActionRqDto { Route = "catalogue-page" })
            .Fragments.Select(f => f.Component).OfType<ServerSideComponentDto>().First()
            .Actions.Where(a => a.Commands is not null).Select(a => a.Id).ToList();
        Assert.DoesNotContain("newOrder", PageActions("hr"));
        Assert.Contains("newOrder", PageActions("manager"));
    }

    [Fact]
    public void An_authored_catalogue_entry_remembers_its_access()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-access-actions-").FullName;
        File.WriteAllText(Path.Combine(dir, "actions.yaml"), """
            actions:
              - id: wipe
                access: {roles: [manager]}
                steps: [{type: Navigate, route: x}]
              - id: open
                steps: [{type: Navigate, route: y}]
            """);
        var registry = new ActionRegistry(ActionRegistry.AuthoredFrom(dir));
        Assert.Equal(["wipe"], registry.RestrictedIds());
        Assert.Equal(["wipe"], registry.RefusedFor(a => a is null));
        Assert.Empty(registry.RefusedFor(_ => true));
        Assert.Equal(["open"], registry.CatalogFor(a => a is null).Actions.Select(a => a.Id));
        Assert.True(registry.Grants("open", a => a is null));
        Assert.False(registry.Grants("wipe", a => a is null));
    }
}
