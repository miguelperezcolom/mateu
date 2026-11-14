using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A route's <c>access:</c> holds for its DEFINITION, whatever spelling of the request reaches it (GA
/// review round 2, J1; Java's YamlRouteSpellingAccessSyncTest and Python's
/// test_route_spelling_access.py are the twins). Before: the check matched the route as sent, while a
/// route no authored entry answers was served by convention from <c>&lt;specs&gt;/&lt;route&gt;.yaml</c>
/// — so the layout file's own path, a dot segment or a case variant served the page, and proxied its
/// server-held calls, to anyone; <c>..</c> even reached a <c>.yaml</c> outside the specs directory.
/// </summary>
public class RouteSpellingAccessTests
{
    private static string Page(string text) => $$"""
        actions:
          - id: purge
            restAction:
              source:
                url: https://api.invalid/purge
                method: DELETE
                proxy: true
                headers: {X-Api-Key: '${secret.PURGE_KEY}'}
        layout:
          type: VerticalLayout
          content:
            - type: Text
              text: {{text}}
            - type: Button
              label: Purge
              actionId: purge
        """;

    private static string Specs()
    {
        var root = Directory.CreateTempSubdirectory("route-spelling-").FullName;
        var dir = Path.Combine(root, "specs");
        Directory.CreateDirectory(Path.Combine(dir, "pages"));
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: admin
                layout: admin.yaml
                access: {roles: [admin]}
              - route: backoffice/users/:id
                layout: pages/user.yaml
                access: {roles: [admin]}
              - route: hello
                layout: hello.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "admin.yaml"), Page("ADMIN-PAGE"));
        File.WriteAllText(Path.Combine(dir, "pages", "user.yaml"), Page("USER-PAGE"));
        File.WriteAllText(Path.Combine(dir, "hello.yaml"), Page("HELLO-PAGE"));
        File.WriteAllText(Path.Combine(root, "outside.yaml"), Page("OUTSIDE-PAGE"));
        return dir;
    }

    private static readonly string Dir = Specs();

    private static SyncHandler Handler(params string[] roles) =>
        new(new MateuRegistry(typeof(Access).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            specsDir: Dir);

    private static string Outcome(string route, string actionId = "", params string[] roles)
    {
        try
        {
            var increment = Handler(roles).Handle(new RunActionRqDto
            {
                Route = route, ActionId = actionId,
                Parameters = actionId == "__restfetch__"
                    ? new() { ["_sourceKind"] = "ACTION", ["_sourceId"] = "purge" }
                    : new(),
            });
            return JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        }
        catch (MateuForbiddenException)
        {
            return "FORBIDDEN";
        }
    }

    public static TheoryData<string> OtherSpellings =>
    [
        "/pages/user",
        "/hello/../admin",
        "/./admin",
        "/hello/%2e%2e/admin",
        "/Admin",
        "/hello/../../../specs/admin",
        "/hello/..\\admin",
    ];

    [Fact]
    public void The_authored_spelling_is_refused()
    {
        Assert.Equal("FORBIDDEN", Outcome("/admin"));
        Assert.Equal("FORBIDDEN", Outcome("/backoffice/users/7"));
        Assert.Contains("HELLO-PAGE", Outcome("/hello"));
    }

    [Theory]
    [MemberData(nameof(OtherSpellings))]
    public void No_other_spelling_serves_the_restricted_definition(string route)
    {
        var outcome = Outcome(route);
        Assert.DoesNotContain("ADMIN-PAGE", outcome);
        Assert.DoesNotContain("USER-PAGE", outcome);
    }

    [Theory]
    [MemberData(nameof(OtherSpellings))]
    public void No_other_spelling_proxies_the_restricted_pages_calls(string route) =>
        Assert.Equal("FORBIDDEN", Outcome(route, "__restfetch__"));

    [Fact]
    public void The_layout_files_path_is_refused_and_an_admin_reaches_it()
    {
        Assert.Equal("FORBIDDEN", Outcome("/pages/user"));
        Assert.Contains("USER-PAGE", Outcome("/pages/user", "", "admin"));
    }

    [Fact]
    public void No_route_reads_a_definition_outside_the_specs_directory()
    {
        Assert.Null(new YamlSpecLoader(Dir).LoadSpec("../outside"));
        Assert.Equal("FORBIDDEN", Outcome("/../outside"));
    }

    [Theory]
    [InlineData("/a/../b", true)]
    [InlineData("/./a", true)]
    [InlineData("/a/%2E%2e", true)]
    [InlineData("a\\b", true)]
    [InlineData("/a/%5cb", true)]
    [InlineData("..", true)]
    [InlineData("", false)]
    [InlineData("/", false)]
    [InlineData("/admin", false)]
    [InlineData("/a.b/c", false)]
    [InlineData("/a/..b", false)]
    [InlineData("/x?next=/../y", false)]
    public void Unsafe_segments(string route, bool unsafeRoute) =>
        Assert.Equal(unsafeRoute, RouteRegistry.HasUnsafeSegments(route));
}
