using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("/push")]
[App("Orders")]
public class PushOrdersApp : IPushTokenRegistry
{
    public static readonly List<(string Call, PushRegistration Registration)> Calls = [];

    [MenuItem("Home")] public FreezeHome Home() => new();

    public void RegisterPushToken(PushRegistration registration) => Calls.Add(("register", registration));

    public void UnregisterPushToken(PushRegistration registration) => Calls.Add(("unregister", registration));
}

[UI("/push-plain")]
[App("Orders")]
public class PushPlainApp
{
    [MenuItem("Home")] public FreezeHome Home() => new();
}

/// <summary>Push notifications on the Mateu mobile app (mirrors Java's PushTokensSyncTest): an app
/// class implementing IPushTokenRegistry advertises PushNotifications, and the _push-register /
/// _push-unregister app-level actions hand it a validated registration with the authenticated
/// caller — never one from the request body.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class PushTokensTests
{
    private const string Token = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";
    private const string Key = "p0123456789abcdef";

    private static SyncHandler Handler(string? principal = null) =>
        new(new MateuRegistry(typeof(PushTokensTests).Assembly)) { Principal = () => principal };

    private static AppMetadataDto App(Type type) => (AppMetadataDto)new ReflectionMapper().MapApp(type).Metadata;

    private static Dictionary<string, object?> Parameters(string? key = null, object? value = null)
    {
        var p = new Dictionary<string, object?>
        {
            ["token"] = Token, ["service"] = "expo", ["platform"] = "ios", ["uiKey"] = Key,
            ["principal"] = "someone-else",
        };
        if (key is not null) p[key] = value;
        // what the wire hands the handler: JSON elements
        return p.ToDictionary(e => e.Key, e => (object?)JsonSerializer.SerializeToElement(e.Value));
    }

    private static RunActionRqDto Rq(string actionId, Type app, Dictionary<string, object?> parameters) => new()
    {
        ServerSideType = app.FullName, Route = app == typeof(PushOrdersApp) ? "/push" : "/push-plain",
        ActionId = actionId, Parameters = parameters,
    };

    [Fact]
    public void An_app_with_a_registry_advertises_push()
    {
        Assert.True(App(typeof(PushOrdersApp)).PushNotifications);
        Assert.False(App(typeof(PushPlainApp)).PushNotifications);
    }

    [Fact]
    public void Register_and_unregister_reach_the_registry_with_the_authenticated_caller()
    {
        PushOrdersApp.Calls.Clear();
        Handler("alice").Handle(Rq("_push-register", typeof(PushOrdersApp), Parameters()));
        Handler("alice").Handle(Rq("_push-unregister", typeof(PushOrdersApp), Parameters()));
        Assert.Equal(["register", "unregister"], PushOrdersApp.Calls.Select(c => c.Call));
        Assert.Equal(new PushRegistration(Token, "expo", "ios", Key, "alice"), PushOrdersApp.Calls[0].Registration);
    }

    [Fact]
    public void An_anonymous_caller_registers_with_no_principal()
    {
        PushOrdersApp.Calls.Clear();
        Handler().Handle(Rq("_push-register", typeof(PushOrdersApp), Parameters()));
        Assert.Null(Assert.Single(PushOrdersApp.Calls).Registration.Principal);
    }

    [Theory]
    [InlineData("token", "not-a-token")]
    [InlineData("token", "ExponentPushToken[ab]")]
    [InlineData("service", "fcm")]
    [InlineData("platform", "web")]
    [InlineData("uiKey", "short")]
    [InlineData("uiKey", "../../etc/passwd")]
    public void A_malformed_registration_never_reaches_the_registry(string key, string value)
    {
        PushOrdersApp.Calls.Clear();
        try
        {
            var answer = Handler().Handle(Rq("_push-register", typeof(PushOrdersApp), Parameters(key, value)));
            Assert.NotEmpty(answer.Messages);
        }
        catch (UserFacingException)
        {
            // refused either way
        }
        Assert.Empty(PushOrdersApp.Calls);
    }

    [Fact]
    public void An_app_without_a_registry_refuses()
    {
        Assert.Throws<MateuForbiddenException>(() =>
            Handler().Handle(Rq("_push-register", typeof(PushPlainApp), Parameters())));
    }
}
