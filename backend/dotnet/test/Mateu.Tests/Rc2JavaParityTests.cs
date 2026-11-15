using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class Rc2PageVm
{
    public string Name { get; set; } = "";
}

public class Rc2Product
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("rc2-renamed-products")]
public class Rc2Products : Crud<Rc2Product>
{
    public override IEnumerable<Rc2Product> Fetch(string? search) => [new() { Id = "1", Name = "Bolt" }];

    [ListToolbarButton(rowsSelectedRequired: false)]
    public Message Replenish() => new("replenished");

    [ViewToolbarButton]
    public Message Archive(Rc2Product product) => new("archived");
}

/// <summary>rc.2: the behaviour Java changed in its GA round-2 fixes (PR #1229), held in .NET too
/// (Python's twin: test_rc2_java_parity.py).
/// <list type="bullet">
/// <item>J1 residual: a layout-less authored route (<c>pages/:name</c> + <c>viewModel:</c>) is served
/// BY CONVENTION from <c>&lt;path&gt;.yaml</c>, so it does not make the definition access check stand
/// down — a restricted route's layout file is not served through it.</item>
/// <item>A crud's <c>action-on-row-&lt;x&gt;</c> / <c>action-on-view-&lt;x&gt;</c> naming no method (a
/// button renamed since the tab opened) is refused 403 like any unknown action.</item>
/// <item>J7: an anonymous caller's idempotency share is also keyed by its client address; the answers
/// stay scoped by the caller alone.</item>
/// <item>J6 does not apply: the ports have no default free-text match — <c>Crud.Fetch(search)</c> is
/// the app's, so the framework never matches a restricted property on its own.</item>
/// </list></summary>
[Collection(ProcessWideStateCollection.Name)]
public class Rc2JavaParityTests
{
    private static string Page(string text) => $$"""
        layout:
          type: VerticalLayout
          content:
            - type: Text
              text: {{text}}
        """;

    private static string J1Specs()
    {
        var root = Directory.CreateTempSubdirectory("rc2-j1-").FullName;
        Directory.CreateDirectory(Path.Combine(root, "pages"));
        File.WriteAllText(Path.Combine(root, "routes.yaml"), $"""
            routes:
              - route: backoffice/users/:id
                layout: pages/user.yaml
                access: {"{"}roles: [admin]{"}"}
              - route: pages/:name
                viewModel: {typeof(Rc2PageVm).FullName}
              - route: open/:id
                layout: pages/open.yaml
            """);
        File.WriteAllText(Path.Combine(root, "pages", "user.yaml"), Page("USER-PAGE"));
        File.WriteAllText(Path.Combine(root, "pages", "other.yaml"), Page("OTHER-PAGE"));
        File.WriteAllText(Path.Combine(root, "pages", "open.yaml"), Page("OPEN-PAGE"));
        return root;
    }

    private static string Load(SyncHandler handler, string route)
    {
        try
        {
            return JsonSerializer.Serialize(handler.Handle(new RunActionRqDto { Route = route }),
                new JsonSerializerOptions(JsonSerializerDefaults.Web));
        }
        catch (MateuForbiddenException)
        {
            return "FORBIDDEN";
        }
    }

    private static SyncHandler J1Handler() =>
        new(new MateuRegistry(typeof(Rc2JavaParityTests).Assembly), specsDir: J1Specs());

    [Fact]
    public void J1_a_layout_less_route_does_not_serve_a_restricted_layout_file() =>
        Assert.DoesNotContain("USER-PAGE", Load(J1Handler(), "pages/user"));

    [Fact]
    public void J1_control_a_layout_less_route_still_serves_unrestricted_pages_by_convention()
    {
        var handler = J1Handler();
        Assert.Contains("OTHER-PAGE", Load(handler, "pages/other"));
        Assert.Contains("OPEN-PAGE", Load(handler, "open/7"));
    }

    private static UIIncrementDto Crud(string action, string route = "rc2-renamed-products") =>
        new SyncHandler(new MateuRegistry(typeof(Rc2JavaParityTests).Assembly)).Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = "rc2-renamed-products", ActionId = action,
            ServerSideType = typeof(Rc2Products).FullName, InitiatorComponentId = "c1",
            ComponentState = new() { ["crud_selected_items"] = JsonSerializer.SerializeToElement(Array.Empty<object>()) },
        });

    [Fact]
    public void The_current_row_button_runs() =>
        Assert.Contains(Crud("action-on-row-replenish").Messages, m => m.Text == "replenished");

    [Theory]
    [InlineData("action-on-row-restock", "rc2-renamed-products")]
    [InlineData("action-on-view-restock", "rc2-renamed-products/1")]
    public void A_renamed_crud_action_is_refused_like_any_unknown_action(string action, string route)
    {
        var refused = Assert.Throws<MateuForbiddenException>(() => Crud(action, route));
        Assert.Contains("no such action", refused.Message);
    }

    [Fact]
    public void J7_an_anonymous_share_is_keyed_by_the_client_address_a_named_one_is_not()
    {
        var anon = IdempotencyKeys.CallerOf(null, null);
        Assert.NotEqual(IdempotencyKeys.ShareOf(anon, null, null, "10.0.0.1"),
            IdempotencyKeys.ShareOf(anon, null, null, "10.0.0.2"));
        Assert.Equal(anon, IdempotencyKeys.ShareOf(anon, null, null, null));
        var ana = new Identity { Name = "ana" };
        var named = IdempotencyKeys.CallerOf(null, ana);
        Assert.Equal(named, IdempotencyKeys.ShareOf(named, ana, null, "10.0.0.1"));
        Assert.Equal(named, IdempotencyKeys.ShareOf(named, null, "ana", "10.0.0.1"));
    }

    [Fact]
    public async Task J7_one_anonymous_address_filling_its_share_leaves_the_others_theirs()
    {
        IdempotencyKeys.Clear();
        var previous = IdempotencyKeys.MaxEntriesPerCaller;
        IdempotencyKeys.MaxEntriesPerCaller = 1;
        var gate = new TaskCompletionSource();
        Func<Task<UIIncrementDto>> Gated(string text) => async () =>
        {
            await gate.Task;
            return UIIncrementDto.Of(messages: [new MessageDto("info", null, "", text, 0)]);
        };
        try
        {
            var anon = IdempotencyKeys.CallerOf(null, null);
            var a = IdempotencyKeys.ShareOf(anon, null, null, "10.0.0.1");
            var b = IdempotencyKeys.ShareOf(anon, null, null, "10.0.0.2");
            var first = IdempotencyKeys.OnceAsync(anon, "save", "rc2-key-a", Gated("A"), share: a);
            // address A's share is full; another anonymous address is still admitted
            var second = IdempotencyKeys.OnceAsync(anon, "save", "rc2-key-b", Gated("B"), share: b);
            await Assert.ThrowsAsync<UserFacingException>(
                () => IdempotencyKeys.OnceAsync(anon, "save", "rc2-key-c", Gated("C"), share: a));
            gate.SetResult();
            await Task.WhenAll(first, second);
            // the answer is the CALLER's: a retry of the key from another address replays it
            var retry = await IdempotencyKeys.OnceAsync(anon, "save", "rc2-key-a", Gated("again"), share: b);
            Assert.Equal("A", Assert.Single(retry.Messages).Text);
        }
        finally
        {
            IdempotencyKeys.MaxEntriesPerCaller = previous;
            IdempotencyKeys.Clear();
        }
    }
}
