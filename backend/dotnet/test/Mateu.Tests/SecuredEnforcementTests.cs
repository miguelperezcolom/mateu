using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

#pragma warning disable CS0618 // [Secured] is deprecated — these fixtures pin that it is still ENFORCED

/// <summary>A view carrying the deprecated [Secured] — before 3.0-alpha.412 nothing read it, so it
/// was open to everyone; now it means exactly [EyesOnly(Permissions = ["orders.read"])].</summary>
[UI("sec-secured"), Title("Secured orders"), Secured("orders.read")]
public class SecSecuredView
{
    public static volatile int Calls;

    public string? Name { get; set; }

    [Button] public Message Go()
    {
        Calls++;
        return new Message("secured went");
    }
}

[App("Secured app")]
public class SecSecuredApp
{
    [MenuItem("Orders")] public SecSecuredView Orders() => new();
    [MenuItem("Open")] public FreezeHome Open() => new();
}

#pragma warning restore CS0618

/// <summary>[Secured] / @secured is ENFORCED with the semantics of [EyesOnly] (3.0-alpha.412): the
/// view (and every action on it) is refused with 403 to a caller without the permission or with no
/// principal at all, served to one holding it, and the menu entry leading to it is hidden.</summary>
[Collection("ActionSecurity")]
public class SecuredEnforcementTests
{
    private static SyncHandler Handler(Identity? identity = null) =>
        new(new MateuRegistry(typeof(SecSecuredView).Assembly), null, () => identity);

    private static RunActionRqDto Load() => new() { Route = "sec-secured", ConsumedRoute = "sec-secured" };

    private static RunActionRqDto Go() => new()
    {
        Route = "sec-secured", ConsumedRoute = "sec-secured", ActionId = "go",
        ComponentState = new(), AppState = new(), Parameters = new(),
    };

    private static void AssertForbidden(SyncHandler handler, RunActionRqDto rq)
    {
        var e = Record.Exception(() => handler.Handle(rq));
        Assert.NotNull(e);
        Assert.Equal("MateuForbiddenException", e!.GetType().Name);
    }

    [Fact]
    public void A_Secured_view_is_refused_with_no_principal()
    {
        var before = SecSecuredView.Calls;
        AssertForbidden(Handler(), Load());
        AssertForbidden(Handler(), Go());
        Assert.Equal(before, SecSecuredView.Calls);
    }

    [Fact]
    public void A_Secured_view_is_refused_to_a_principal_without_the_permission()
    {
        var before = SecSecuredView.Calls;
        var staff = new Identity(Roles: ["staff"], Permissions: ["orders.write"]);
        AssertForbidden(Handler(staff), Load());
        AssertForbidden(Handler(staff), Go());
        Assert.Equal(before, SecSecuredView.Calls);
    }

    [Fact]
    public void A_Secured_view_is_served_to_a_principal_holding_the_permission()
    {
        var reader = new Identity(Permissions: ["orders.read"]);
        Assert.NotNull(Handler(reader).Handle(Load()));
        var json = JsonSerializer.Serialize(Handler(reader).Handle(Go()));
        Assert.Contains("secured went", json);
    }

    [Fact]
    public void The_menu_entry_leading_to_a_Secured_view_is_hidden_without_the_permission()
    {
        static IEnumerable<string> Labels(Identity? id) =>
            ((AppMetadataDto)new ReflectionMapper(identity: () => id).MapApp(typeof(SecSecuredApp)).Metadata)
            .Menu.Select(m => m.Label);

        Assert.Equal(["Open"], Labels(null));
        Assert.Equal(["Open"], Labels(new Identity(Roles: ["staff"])));
        Assert.Equal(["Orders", "Open"], Labels(new Identity(Permissions: ["orders.read"])));
    }
}
