using System.Net;
using System.Text;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Core.Push;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// Remote push: the phone registers its token (_push-register), an inbox message reaches the app's
// IPushSender with the caller's tokens, gone tokens are dropped, the app says push is on, and
// Mateu's Expo sender batches and reads its tickets. Mirrors Java's RemotePushSyncTest /
// ExpoPushSenderTest and Python's test_remote_push.py.

[Collection(ProcessWideStateCollection.Name)]
public class RemotePushTests
{
    private sealed class FakeSender : IPushSender
    {
        public readonly List<(PushMessage Message, IReadOnlyList<PushToken> Tokens)> Sent = [];
        public readonly HashSet<string> Gone = [];

        public Task<PushResult> SendAsync(PushMessage message, IReadOnlyList<PushToken> tokens,
            CancellationToken cancellationToken = default)
        {
            lock (Sent) Sent.Add((message, tokens));
            return Task.FromResult(new PushResult(tokens.Count, tokens.Select(t => t.Token).Where(Gone.Contains).ToList()));
        }
    }

    private static SyncHandler Handler(string? principal, IPushSender? sender, IPushTokenStore store,
        string? sessionId = null) =>
        new(new MateuRegistry(typeof(RemotePushTests).Assembly))
        {
            Principal = () => principal,
            InboxStore = new InMemoryInboxStore(),
            PushSender = sender,
            PushTokenStore = store,
            RequestHeader = name => name == "X-Session-Id" ? sessionId : null,
        };

    private static RunActionRqDto AppRq(string actionId, Dictionary<string, object?> parameters) => new()
    {
        ServerSideType = typeof(InboxOnlyApp).FullName, Route = "/inbox-only", ActionId = actionId,
        InitiatorComponentId = "_ux", Parameters = parameters,
    };

    private static Dictionary<string, object?> Registration(string token, string deviceId) => new()
    {
        ["token"] = token, ["platform"] = "android", ["deviceId"] = deviceId,
        ["ui"] = "https://ops.example.com/inbox-only",
    };

    private static bool Registered(UIIncrementDto increment) =>
        increment.Fragments.Select(f => f.Data).OfType<Dictionary<string, object?>>()
            .Select(d => (Dictionary<string, object?>)d["_push"]!).Select(p => (bool)p["registered"]!).First();

    [Fact]
    public void The_app_says_push_is_on_only_with_a_sender()
    {
        var store = new InMemoryPushTokenStore();
        var on = JsonSerializer.Serialize(Handler(null, new FakeSender(), store).Handle(new RunActionRqDto
            { ServerSideType = typeof(InboxOnlyApp).FullName, Route = "/inbox-only" }), MateuExtensions.Json);
        Assert.Contains("\"pushNotifications\":true", on);
        var off = JsonSerializer.Serialize(Handler(null, null, store).Handle(new RunActionRqDto
            { ServerSideType = typeof(InboxOnlyApp).FullName, Route = "/inbox-only" }), MateuExtensions.Json);
        Assert.DoesNotContain("\"pushNotifications\":true", off);
    }

    [Fact]
    public async Task A_registered_phone_gets_a_push_for_an_inbox_message()
    {
        var sender = new FakeSender();
        var store = new InMemoryPushTokenStore();
        var handler = Handler("alice", sender, store);
        Assert.True(Registered(handler.Handle(AppRq(RemotePush.RegisterAction, Registration("ExponentPushToken[a]", "d1")))));
        var token = Assert.Single(store.TokensFor("alice"));
        Assert.Equal(("android", "https://ops.example.com/inbox-only"), (token.Platform, token.Ui));

        handler.Handle(new RunActionRqDto
            { ServerSideType = typeof(ReattachJobs).FullName, Route = "/reattach-jobs", ActionId = "saved", Parameters = [] });
        for (var i = 0; i < 100 && sender.Sent.Count == 0; i++) await Task.Delay(20);
        var (message, tokens) = Assert.Single(sender.Sent);
        Assert.Equal(("Saved", "/orders/1", "order-1"), (message.Title, message.Route, message.Id));
        Assert.Equal("ExponentPushToken[a]", Assert.Single(tokens).Token);

        handler.Handle(AppRq(RemotePush.UnregisterAction, new() { ["token"] = "ExponentPushToken[a]" }));
        Assert.Empty(store.TokensFor("alice"));
    }

    [Fact]
    public async Task A_gone_token_is_dropped_and_an_anonymous_phone_is_kept_under_its_session()
    {
        var sender = new FakeSender();
        var store = new InMemoryPushTokenStore();
        var handler = Handler(null, sender, store, sessionId: "s-42");
        handler.Handle(AppRq(RemotePush.RegisterAction, Registration("ExponentPushToken[gone]", "d2")));
        Assert.Single(store.TokensFor(PushNotifications.SessionKey("s-42")));
        sender.Gone.Add("ExponentPushToken[gone]");
        await handler.DeliverPushAsync(PushNotifications.SessionKey("s-42"), new PushMessage("Hi"));
        Assert.Empty(store.TokensFor(PushNotifications.SessionKey("s-42")));
    }

    [Fact]
    public void Without_a_sender_nothing_is_kept_and_a_token_is_required()
    {
        var store = new InMemoryPushTokenStore();
        Assert.False(Registered(Handler("alice", null, store)
            .Handle(AppRq(RemotePush.RegisterAction, Registration("ExponentPushToken[x]", "d3")))));
        Assert.Empty(store.TokensFor("alice"));
        var refused = Assert.Throws<UserFacingException>(() => Handler("alice", new FakeSender(), store)
            .Handle(AppRq(RemotePush.RegisterAction, new() { ["platform"] = "ios" })));
        Assert.Equal("A push token is needed.", refused.Message);
    }

    [Fact]
    public void The_store_replaces_a_device_and_drops_non_web_uis()
    {
        var store = new InMemoryPushTokenStore();
        store.Register("ana", RemotePush.TokenOf("ExponentPushToken[old]", "ios", "dev", "https://a.example.com"));
        store.Register("ana", RemotePush.TokenOf("ExponentPushToken[new]", "ios", "dev", "https://a.example.com"));
        Assert.Equal("ExponentPushToken[new]", Assert.Single(store.TokensFor("ana")).Token);
        Assert.Null(RemotePush.TokenOf("ExponentPushToken[js]", "x", "bad id!", "javascript:alert(1)").Ui);
        for (var i = 0; i < InMemoryPushTokenStore.MaxPerPrincipal + 3; i++)
            store.Register("bob", new PushToken($"ExponentPushToken[b{i}]"));
        Assert.Equal(InMemoryPushTokenStore.MaxPerPrincipal, store.TokensFor("bob").Count);
    }

    private sealed class FakeExpo : HttpMessageHandler
    {
        public readonly List<JsonElement> Batches = [];
        public readonly List<string?> Authorizations = [];

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            using var doc = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(ct));
            var body = doc.RootElement.Clone();
            lock (Batches)
            {
                Batches.Add(body);
                Authorizations.Add(request.Headers.Authorization?.ToString());
            }
            var tickets = body.EnumerateArray().Select(m => m.GetProperty("to").GetString()!.Contains("gone")
                ? "{\"status\":\"error\",\"details\":{\"error\":\"DeviceNotRegistered\"}}"
                : "{\"status\":\"ok\",\"id\":\"t\"}");
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{\"data\":[" + string.Join(",", tickets) + "]}", Encoding.UTF8, "application/json"),
            };
        }
    }

    [Fact]
    public async Task The_expo_sender_batches_by_a_hundred_and_reports_gone_tokens()
    {
        var expo = new FakeExpo();
        var tokens = Enumerable.Range(0, 230).Select(i => new PushToken($"ExponentPushToken[p{i}]", "android", null, "https://ops.example.com/app"))
            .Append(new PushToken("ExponentPushToken[gone-1]")).ToList();
        var result = await new ExpoPushSender(new HttpClient(expo), null, "secret")
            .SendAsync(new PushMessage("Export ready", "Your file", "/exports/7"), tokens);
        Assert.Equal([100, 100, 31], expo.Batches.Select(b => b.GetArrayLength()));
        Assert.Equal(230, result.Accepted);
        Assert.Equal(["ExponentPushToken[gone-1]"], result.UnregisteredTokens);
        Assert.All(expo.Authorizations, a => Assert.Equal("Bearer secret", a));
        var first = expo.Batches[0][0];
        Assert.Equal("Export ready", first.GetProperty("title").GetString());
        Assert.Equal("Your file", first.GetProperty("body").GetString());
        Assert.Equal("mateu", first.GetProperty("channelId").GetString());
        Assert.Equal("https://ops.example.com/app", first.GetProperty("data").GetProperty("ui").GetString());
        Assert.Equal("/exports/7", first.GetProperty("data").GetProperty("route").GetString());
    }

    [Fact]
    public void Push_notifications_send_reaches_a_subscribed_delivery()
    {
        var got = new List<(string, PushMessage)>();
        using (PushNotifications.Subscribe((p, m) => got.Add((p, m))))
        {
            PushNotifications.Send("ana", new AppNotification("n1", "Title", "Text", "/x", true, null));
            PushNotifications.SendToSession("s1", new PushMessage("Hi"));
            PushNotifications.Send("", new PushMessage("ignored"));
        }
        Assert.Equal([("ana", "/x"), ("session:s1", null)], got.Select(g => (g.Item1, g.Item2.Route)));
    }

    private sealed class AnswerExpo(HttpStatusCode status, string body) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
            Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") });
    }

    [Theory]
    [InlineData(HttpStatusCode.InternalServerError, "{}")]
    [InlineData(HttpStatusCode.OK, "not json")]
    [InlineData(HttpStatusCode.OK, "{\"errors\":[]}")]
    public async Task An_expo_answer_that_is_no_list_of_tickets_accepts_nothing(HttpStatusCode status, string body)
    {
        var result = await new ExpoPushSender(new HttpClient(new AnswerExpo(status, body)))
            .SendAsync(new PushMessage("Hi"), [new PushToken("ExponentPushToken[a]")]);
        Assert.Equal(0, result.Accepted);
        Assert.Empty(result.UnregisteredTokens);
    }

    private sealed class ThrowingSender : IPushSender
    {
        public Task<PushResult> SendAsync(PushMessage message, IReadOnlyList<PushToken> tokens, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("down");
    }

    [Fact]
    public async Task Delivery_drops_gone_tokens_and_never_throws()
    {
        var store = new InMemoryPushTokenStore();
        store.Register("ana", new PushToken("ExponentPushToken[keep]"));
        store.Register("ana", new PushToken("ExponentPushToken[gone]"));
        var sender = new FakeSender();
        sender.Gone.Add("ExponentPushToken[gone]");
        await RemotePush.DeliverAsync("ana", new PushMessage("Hi"), sender, store);
        Assert.Equal("ExponentPushToken[keep]", Assert.Single(store.TokensFor("ana")).Token);
        // nobody's phones: nothing is sent
        await RemotePush.DeliverAsync("nobody", new PushMessage("Hi"), sender, store);
        Assert.Single(sender.Sent);
        // a failing sender is logged, not thrown
        await RemotePush.DeliverAsync("ana", new PushMessage("Hi"), new ThrowingSender(), store);
    }

    [Fact]
    public void The_app_store_wins_and_the_owner_is_the_principal_else_the_session()
    {
        var app = new InMemoryPushTokenStore();
        var fallback = new InMemoryPushTokenStore();
        Assert.Same(app, RemotePush.Store(app, fallback));
        Assert.Same(fallback, RemotePush.Store(null, fallback));
        Assert.Same(fallback, RemotePush.Store(null, fallback));
        Assert.Equal("ana", RemotePush.OwnerOf("ana", "s1"));
        Assert.Equal(PushNotifications.SessionKey("s1"), RemotePush.OwnerOf(null, "s1"));
        Assert.Null(RemotePush.OwnerOf(" ", new string('x', 200)));
        Assert.Null(RemotePush.WebUrl("ftp://files.example.com/x"));
        Assert.Equal("http://a.example.com/x", RemotePush.WebUrl("http://a.example.com/x"));
        Assert.False(RemotePush.ValidToken(null));
    }
}
