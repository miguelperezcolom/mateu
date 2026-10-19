using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Core.AgentPush;
using Mateu.Core.Mcp;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

/// <summary>Live UI push (phase C) on the .NET backend: <c>conformance/mcp/push.json</c> — the tool
/// definitions byte for byte and the scripted scenario — plus the registry's limits (expiry, rate,
/// max sessions, refused channels, pairing attempts), the disabled switch and a real SSE channel
/// receiving a pushed screen over HTTP. The .NET twin of Java's agent-push corpus/sync tests.</summary>
public class AgentPushTests
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    static readonly MateuRegistry Registry = new(typeof(AgentPushTests).Assembly);

    static JsonObject Corpus()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "conformance", "mcp"))) dir = dir.Parent;
        Assert.NotNull(dir);
        return (JsonObject)JsonNode.Parse(File.ReadAllText(Path.Combine(dir!.FullName, "conformance", "mcp", "push.json")))!;
    }

    static void Same(JsonNode? expected, JsonNode? actual, string what) =>
        Assert.True(expected?.ToJsonString() == actual?.ToJsonString(),
            $"{what}\nexpected: {expected?.ToJsonString()}\nactual:   {actual?.ToJsonString()}");

    sealed class Fixture
    {
        public DateTimeOffset Now = new(2026, 10, 19, 10, 0, 0, TimeSpan.Zero);
        public string? Principal;
        public string? Address;
        public readonly AgentSessions Sessions;
        public readonly SyncHandler Handler;

        public Fixture(int rate = 30, int max = 1000, bool push = true, int perOwner = 20, int perAddress = 200)
        {
            Sessions = new AgentSessions(rate, max, perOwner, () => Now) { MaxAnonymousSessionsPerAddress = perAddress };
            Handler = new SyncHandler(Registry)
            {
                AgentPush = push ? Sessions : null, Principal = () => Principal, ClientAddress = () => Address,
            };
        }

        public McpService Mcp(AgentCaller caller) => new(Handler, Json) { Push = Handler.AgentPush, Caller = caller };

        public AgentChannel Open(string sessionId, string secret, string? principal, string route = "/",
            string renderer = "vaadin", string? address = null)
        {
            Principal = principal;
            Address = address;
            return Handler.OpenAgentChannel(Rq(SyncHandler.AgentChannelAction, sessionId, secret,
                ("route", route), ("renderer", renderer)));
        }

        public UIIncrementDto Ui(string action, string sessionId, string secret, string? principal)
        {
            Principal = principal;
            return Handler.Handle(Rq(action, sessionId, secret));
        }

        public string PairCode(string sessionId, string secret, string? principal)
        {
            var increment = Ui(SyncHandler.AgentPairAction, sessionId, secret, principal);
            var data = (Dictionary<string, object?>)increment.Fragments[0].Data!;
            var pairing = (Dictionary<string, object?>)data[SyncHandler.AgentPairingKey]!;
            Assert.Equal(300, pairing["expiresInSeconds"]);
            return (string)pairing["code"]!;
        }
    }

    static RunActionRqDto Rq(string action, string sessionId, string secret, params (string Key, string Value)[] extra)
    {
        var parameters = new Dictionary<string, object?> { ["sessionId"] = sessionId, ["secret"] = secret };
        foreach (var (k, v) in extra) parameters[k] = v;
        return new RunActionRqDto
        {
            ActionId = action, Route = "", Parameters = parameters,
        };
    }

    static (bool IsError, string Text) Tool(McpService svc, string name, JsonObject arguments)
    {
        var r = McpJsonRpc.Handle(new JsonObject
        {
            ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = "tools/call",
            ["params"] = new JsonObject { ["name"] = name, ["arguments"] = arguments },
        }, svc, false, null);
        var result = r!["result"]!;
        return (result["isError"]?.GetValue<bool>() == true, (string)result["content"]![0]!["text"]!);
    }

    static JsonNode ToolOk(McpService svc, string name, JsonObject arguments)
    {
        var (isError, text) = Tool(svc, name, arguments);
        Assert.False(isError, text);
        return JsonNode.Parse(text)!;
    }

    static string ToolError(McpService svc, string name, JsonObject arguments)
    {
        var (isError, text) = Tool(svc, name, arguments);
        Assert.True(isError, text);
        return text["Error: ".Length..];
    }

    static List<JsonNode> Drain(AgentChannel channel)
    {
        var list = new List<JsonNode>();
        while (channel.Queue.Reader.TryRead(out var increment))
            list.Add(JsonSerializer.SerializeToNode(increment, Json)!["commands"]![0]!["data"]!.DeepClone());
        return list;
    }

    // ── the corpus ───────────────────────────────────────────────────────────────────────────

    [Fact]
    public void Push_tools_are_the_corpus_listed_after_the_base_tools_and_before_save_spec()
    {
        var plain = McpJsonRpc.Tools(false);
        var push = McpJsonRpc.Tools(false, true);
        Same(Corpus()["pushTools"], new JsonArray(push.Skip(plain.Count).Select(t => t!.DeepClone()).ToArray()), "pushTools");
        var all = McpJsonRpc.Tools(true, true);
        Assert.Equal("mateu_save_spec", (string)all[^1]!["name"]!);
        Assert.Equal(plain.Count + 6, all.Count);
        // over tools/list too, when the service carries the sessions
        var listed = McpJsonRpc.Handle(new JsonObject { ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = "tools/list" },
            new Fixture().Mcp(AgentCaller.Anonymous), false, null)!["result"]!["tools"]!.AsArray();
        Same(push, listed, "tools/list with push");
    }

    [Fact]
    public void The_error_texts_are_the_corpus()
    {
        var errors = Corpus()["errors"]!;
        Assert.Equal(AgentSessions.Disabled, (string)errors["disabled"]!);
        Assert.Equal(AgentSessions.UnknownSession("{session}"), (string)errors["unknownSession"]!);
        Assert.Equal(AgentSessions.NotConnected("{session}"), (string)errors["notConnected"]!);
        Assert.Equal(AgentSessions.RateLimited, (string)errors["rateLimited"]!);
        Assert.Equal(AgentSessions.InvalidCode, (string)errors["invalidCode"]!);
        Assert.Equal(AgentSessions.TooManyAttempts, (string)errors["tooManyAttempts"]!);
        Assert.Equal(AgentSessions.ReservedEvent("{event}"), (string)errors["reservedEvent"]!);
        Assert.Equal(AgentSessions.InvalidEvent("{event}"), (string)errors["invalidEvent"]!);
        Assert.Equal(AgentSessions.DetailTooLarge, (string)errors["detailTooLarge"]!);
        Assert.Equal(AgentSessions.InvalidTarget("{target}"), (string)errors["invalidTarget"]!);
        Assert.Equal(AgentSessions.ChannelRefused, (string)errors["channelRefused"]!);
        Assert.Equal(AgentSessions.TooManySessions, (string)errors["tooManySessions"]!);
        Assert.Equal(AgentSessions.HasErrors, (string)Corpus()["reasons"]!["hasErrors"]!);
        Assert.Equal(AgentSessions.NotAPage, (string)Corpus()["reasons"]!["notAPage"]!);
    }

    [Fact]
    public void The_scenario_of_the_corpus_runs()
    {
        var scenario = Corpus()["scenario"]!;
        var f = new Fixture();
        var channels = new Dictionary<string, AgentChannel>();
        var secrets = new Dictionary<string, (string Secret, string? Principal)>();
        var codes = new Dictionary<string, string>();
        foreach (var s in scenario["sessions"]!.AsArray())
        {
            var id = (string)s!["sessionId"]!;
            var principal = (string?)s["principal"];
            secrets[id] = ((string)s["secret"]!, principal);
            channels[id] = f.Open(id, (string)s["secret"]!, principal, (string)s["route"]!, (string)s["renderer"]!);
            f.Now = f.Now.AddSeconds(1);
        }
        var handles = channels.ToDictionary(kv => kv.Key, kv => kv.Value.Session.Handle);
        AgentCaller CallerOf(string who) => who == "anon" ? AgentCaller.Anonymous : AgentCaller.From(who, null);

        JsonNode? Substitute(JsonNode? node) => node switch
        {
            JsonObject o => new JsonObject(o.Select(kv => KeyValuePair.Create(kv.Key, Substitute(kv.Value)))),
            JsonArray a => new JsonArray(a.Select(Substitute).ToArray()),
            JsonValue v when v.TryGetValue<string>(out var text) => JsonValue.Create(Resolve(text)),
            _ => node?.DeepClone(),
        };
        string Resolve(string text)
        {
            foreach (var (id, handle) in handles) text = text.Replace("<session:" + id + ">", handle);
            foreach (var (id, code) in codes) text = text.Replace("<code:" + id + ">", code);
            return text;
        }
        string Normalise(string text)
        {
            foreach (var (id, handle) in handles) text = text.Replace(handle, "<session:" + id + ">");
            return text;
        }
        JsonNode? Normalised(JsonNode? node)
        {
            switch (node)
            {
                case JsonObject o:
                    var copy = new JsonObject();
                    foreach (var (k, v) in o) copy[k] = k == "connectedAt" ? "<time>" : Normalised(v);
                    return copy;
                case JsonArray a:
                    return new JsonArray(a.Select(Normalised).ToArray());
                case JsonValue v when v.TryGetValue<string>(out var text):
                    return JsonValue.Create(Normalise(text));
                default:
                    return node?.DeepClone();
            }
        }

        var step = 0;
        foreach (var s in scenario["steps"]!.AsArray())
        {
            step++;
            if (s!["received"] is { } received)
            {
                var actual = new JsonArray(Drain(channels[(string)received!]).ToArray());
                Same(s["expect"], Normalised(actual), $"step {step}: received by {received}");
            }
            else if (s["ui"] is { } ui)
            {
                var id = (string)s["sessionId"]!;
                var (secret, principal) = secrets[id];
                switch ((string)ui!)
                {
                    case "pair": codes[id] = f.PairCode(id, secret, principal); break;
                    case "unpair": f.Ui(SyncHandler.AgentUnpairAction, id, secret, principal); break;
                    case "disconnect": f.Sessions.Closed(channels[id]); break;
                    default: throw new InvalidOperationException("unknown ui operation " + ui);
                }
            }
            else
            {
                var svc = f.Mcp(CallerOf((string)s["as"]!));
                var (isError, text) = Tool(svc, (string)s["tool"]!, (JsonObject)Substitute(s["args"])!);
                JsonNode actual = isError
                    ? new JsonObject { ["error"] = Normalise(text["Error: ".Length..]) }
                    : Normalised(JsonNode.Parse(text))!;
                Same(s["expect"], actual, $"step {step}: {s["as"]} {s["tool"]}");
            }
        }
    }

    // ── switches ─────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void With_push_off_the_tools_are_neither_listed_nor_callable_and_the_ui_actions_are_refused()
    {
        var f = new Fixture(push: false);
        var svc = f.Mcp(AgentCaller.From("alice", null));
        Assert.Null(svc.Push);
        var listed = McpJsonRpc.Handle(new JsonObject { ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = "tools/list" },
            svc, false, null)!["result"]!["tools"]!.AsArray();
        Assert.DoesNotContain(listed, t => ((string)t!["name"]!).StartsWith("mateu_push") || (string)t["name"]! == "mateu_list_sessions");
        foreach (var name in McpPushTools.Names)
            Assert.Equal("Unknown tool: " + name, ToolError(svc, name, new JsonObject()));
        Assert.Equal(AgentSessions.Disabled,
            Assert.Throws<UserFacingException>(() => f.Open("ui-1", "secret-1", "alice")).Message);
        Assert.Equal(AgentSessions.Disabled, Assert.Throws<UserFacingException>(() =>
            f.Ui(SyncHandler.AgentPairAction, "ui-1", "secret-1", "alice")).Message);
        Assert.Equal(AgentSessions.Disabled, Assert.Throws<UserFacingException>(() =>
            f.Ui(SyncHandler.AgentUnpairAction, "ui-1", "secret-1", "alice")).Message);
    }

    [Fact]
    public void The_app_announces_push_only_when_it_is_on()
    {
        static bool? App(SyncHandler handler)
        {
            var root = JsonSerializer.SerializeToNode(handler.Handle(new RunActionRqDto
            {
                ServerSideType = typeof(E2FrontDeskApp).FullName, Route = "/e2",
            }), Json)!;
            JsonObject? Find(JsonNode? n) => n switch
            {
                JsonObject o when (string?)o["type"] == "App" => o,
                JsonObject o => o.Select(kv => Find(kv.Value)).FirstOrDefault(x => x is not null),
                JsonArray a => a.Select(Find).FirstOrDefault(x => x is not null),
                _ => null,
            };
            var app = Find(root);
            Assert.NotNull(app);
            return app!["agentPush"]?.GetValue<bool>();
        }
        Assert.True(App(new Fixture().Handler));
        Assert.Null(App(new Fixture(push: false).Handler));
    }

    [Fact]
    public void Options_turn_push_on_only_together_with_mcp()
    {
        Assert.True(new MateuOptions { Mcp = true, McpPush = true }.McpPushEffective);
        Assert.False(new MateuOptions { Mcp = false, McpPush = true }.McpPushEffective);
        Assert.False(new MateuOptions { Mcp = true, McpPush = false }.McpPushEffective);
        Assert.Equal(7, new MateuOptions { McpPushRatePerMinute = 7 }.PushRatePerMinute);
        Assert.Equal(3, new MateuOptions { McpPushMaxSessions = 3 }.PushMaxSessions);
    }

    // ── the registry's rules ─────────────────────────────────────────────────────────────────

    [Fact]
    public void A_disconnected_session_is_forgotten_120_seconds_after_its_stream_ended()
    {
        var f = new Fixture();
        var channel = f.Open("ui-1", "secret-1", "alice");
        var handle = channel.Session.Handle;
        var alice = f.Mcp(AgentCaller.From("alice", null));
        f.Sessions.Closed(channel);
        Assert.Equal(AgentSessions.NotConnected(handle), ToolError(alice, "mateu_navigate", new() { ["session"] = handle, ["route"] = "/" }));
        f.Now = f.Now.AddSeconds(119);
        Assert.Single(ToolOk(alice, "mateu_list_sessions", new())["sessions"]!.AsArray());
        f.Now = f.Now.AddSeconds(1);
        Assert.Empty(ToolOk(alice, "mateu_list_sessions", new())["sessions"]!.AsArray());
        Assert.Equal(AgentSessions.UnknownSession(handle), ToolError(alice, "mateu_navigate", new() { ["session"] = handle, ["route"] = "/" }));
        // a reconnection within the grace period keeps the handle
        var again = f.Open("ui-2", "secret-2", "alice");
        f.Sessions.Closed(again);
        f.Now = f.Now.AddSeconds(60);
        var reopened = f.Open("ui-2", "secret-2", "alice");
        Assert.Equal(again.Session.Handle, reopened.Session.Handle);
        f.Now = f.Now.AddSeconds(600);
        Assert.Single(ToolOk(alice, "mateu_list_sessions", new())["sessions"]!.AsArray());
    }

    [Fact]
    public void A_new_channel_replaces_the_old_stream()
    {
        var f = new Fixture();
        var first = f.Open("ui-1", "secret-1", "alice");
        var second = f.Open("ui-1", "secret-1", "alice");
        Assert.True(first.Queue.Reader.Completion.IsCompleted || Drain(first).Count == 1);
        // the old stream ending does not disconnect the new one
        f.Sessions.Closed(first);
        Assert.True(second.Session.Connected);
        var handle = second.Session.Handle;
        Assert.True(ToolOk(f.Mcp(AgentCaller.From("alice", null)), "mateu_navigate",
            new() { ["session"] = handle, ["route"] = "/x" })["delivered"]!.GetValue<bool>());
        Assert.Equal(2, Drain(second).Count); // status + navigate
    }

    [Fact]
    public void The_rate_limit_is_per_session_and_per_rolling_minute()
    {
        var f = new Fixture(rate: 3);
        var handle = f.Open("ui-1", "secret-1", "alice").Session.Handle;
        var alice = f.Mcp(AgentCaller.From("alice", null));
        JsonObject Args() => new() { ["session"] = handle, ["event"] = "ping" };
        for (var i = 0; i < 3; i++)
        {
            ToolOk(alice, "mateu_dispatch_event", Args());
            f.Now = f.Now.AddSeconds(10);
        }
        Assert.Equal(AgentSessions.RateLimited, ToolError(alice, "mateu_dispatch_event", Args()));
        // another session has its own budget
        var other = f.Open("ui-2", "secret-2", "alice").Session.Handle;
        ToolOk(alice, "mateu_dispatch_event", new() { ["session"] = other, ["event"] = "ping" });
        // the first message leaves the window 60 s after it was sent
        f.Now = f.Now.AddSeconds(30);
        ToolOk(alice, "mateu_dispatch_event", Args());
        Assert.Equal(AgentSessions.RateLimited, ToolError(alice, "mateu_dispatch_event", Args()));
    }

    [Fact]
    public void Max_sessions_evicts_a_disconnected_one_else_refuses()
    {
        var f = new Fixture(max: 2);
        var a = f.Open("ui-1", "s-1", "alice");
        f.Open("ui-2", "s-2", "alice");
        Assert.Equal(AgentSessions.TooManySessions,
            Assert.Throws<UserFacingException>(() => f.Open("ui-3", "s-3", "alice")).Message);
        f.Sessions.Closed(a);
        f.Open("ui-3", "s-3", "alice");
        Assert.Equal(2, f.Sessions.Count);
        var listed = ToolOk(f.Mcp(AgentCaller.From("alice", null)), "mateu_list_sessions", new())["sessions"]!.AsArray();
        Assert.DoesNotContain(listed, s => (string)s!["session"]! == a.Session.Handle);
    }

    [Fact]
    public void Max_sessions_per_owner_refuses_a_new_session_of_that_owner_when_all_are_connected()
    {
        var f = new Fixture(perOwner: 2);
        f.Open("ui-1", "s-1", "alice");
        f.Open("ui-2", "s-2", "alice");
        Assert.Equal(AgentSessions.TooManySessions,
            Assert.Throws<UserFacingException>(() => f.Open("ui-3", "s-3", "alice")).Message);
        Assert.Equal(2, f.Sessions.Count);
    }

    [Fact]
    public void Max_sessions_per_owner_evicts_that_owners_longest_disconnected_session()
    {
        var f = new Fixture(perOwner: 3);
        var a = f.Open("ui-1", "s-1", "alice");
        var b = f.Open("ui-2", "s-2", "alice");
        f.Open("ui-3", "s-3", "alice");
        var bob = f.Open("ui-b", "s-b", "bob");
        f.Sessions.Closed(bob);
        f.Sessions.Closed(a);
        f.Now = f.Now.AddSeconds(10);
        f.Sessions.Closed(b);
        f.Open("ui-4", "s-4", "alice");
        var listed = ToolOk(f.Mcp(AgentCaller.From("alice", null)), "mateu_list_sessions", new())["sessions"]!.AsArray();
        var handles = listed.Select(s => (string)s!["session"]!).ToList();
        Assert.DoesNotContain(a.Session.Handle, handles); // the longest-disconnected one went
        Assert.Contains(b.Session.Handle, handles);
        Assert.Equal(3, handles.Count);
        // Bob's disconnected session is another owner's: untouched.
        Assert.Single(ToolOk(f.Mcp(AgentCaller.From("bob", null)), "mateu_list_sessions", new())["sessions"]!.AsArray());
    }

    [Fact]
    public void Max_sessions_per_owner_leaves_another_owner_unaffected()
    {
        var f = new Fixture(perOwner: 1);
        f.Open("ui-1", "s-1", "alice");
        Assert.Throws<UserFacingException>(() => f.Open("ui-2", "s-2", "alice"));
        f.Open("ui-3", "s-3", "bob");
        Assert.Equal(2, f.Sessions.Count);
    }

    // NM5: the per-owner cap is a SIGNED-IN user's; strangers behind one reverse proxy (one address)
    // each count on their own, and anonymous sessions are capped per address by a higher limit.
    [Fact]
    public void Anonymous_uis_behind_one_address_do_not_lock_each_other_out()
    {
        var f = new Fixture(perOwner: 1);
        for (var i = 0; i < 30; i++) f.Open("proxy-" + i, "s-" + i, null, address: "192.0.2.1");
        Assert.Equal(30, f.Sessions.Count);
    }

    [Fact]
    public void Anonymous_uis_are_capped_per_client_address_by_their_own_higher_limit()
    {
        var f = new Fixture(perOwner: 1, perAddress: 2);
        f.Open("ui-1", "s-1", null, address: "10.0.0.1");
        var old = f.Open("ui-2", "s-2", null, address: "10.0.0.1");
        Assert.Equal(AgentSessions.TooManySessions,
            Assert.Throws<UserFacingException>(() => f.Open("ui-3", "s-3", null, address: "10.0.0.1")).Message);
        f.Open("ui-4", "s-4", null, address: "10.0.0.2"); // another address counts on its own
        f.Open("ui-5", "s-5", "alice", address: "10.0.0.1"); // a signed-in user: their own cap
        f.Sessions.Closed(old);
        f.Open("ui-3", "s-3", null, address: "10.0.0.1"); // evicts the disconnected one
        // an address the host cannot tell is not limited (only the global cap)
        for (var i = 0; i < 10; i++) f.Open("unknown-" + i, "u-" + i, null);
        Assert.Equal(14, f.Sessions.Count);
        Assert.Equal(200, new MateuOptions().PushMaxAnonymousSessionsPerAddress);
        Assert.Equal(9, new MateuOptions { McpPushMaxAnonymousSessionsPerAddress = 9 }.PushMaxAnonymousSessionsPerAddress);
    }

    [Fact]
    public void A_reconnect_is_never_refused_by_either_cap()
    {
        var f = new Fixture(max: 2, perOwner: 1);
        var a = f.Open("ui-1", "s-1", "alice");
        f.Open("ui-2", "s-2", "bob");
        f.Sessions.Closed(a);
        var again = f.Open("ui-1", "s-1", "alice");
        Assert.Same(a.Session, again.Session);
        f.Open("ui-2", "s-2", "bob"); // connected and at both caps
        Assert.Equal(2, f.Sessions.Count);
    }

    [Fact]
    public void The_per_owner_cap_option_defaults_to_20()
    {
        Assert.Equal(20, new MateuOptions().PushMaxSessionsPerOwner);
        Assert.Equal(5, new MateuOptions { McpPushMaxSessionsPerOwner = 5 }.PushMaxSessionsPerOwner);
    }

    [Fact]
    public void A_session_refuses_another_secret_or_another_principal()
    {
        var f = new Fixture();
        f.Open("ui-1", "secret-1", "alice");
        Assert.Equal(AgentSessions.ChannelRefused,
            Assert.Throws<UserFacingException>(() => f.Open("ui-1", "other-secret", "alice")).Message);
        Assert.Equal(AgentSessions.ChannelRefused,
            Assert.Throws<UserFacingException>(() => f.Open("ui-1", "secret-1", "mallory")).Message);
        Assert.Equal(AgentSessions.ChannelRefused,
            Assert.Throws<UserFacingException>(() => f.Open("ui-1", "secret-1", null)).Message);
        Assert.Equal(AgentSessions.ChannelRefused, Assert.Throws<UserFacingException>(() =>
            f.Ui(SyncHandler.AgentPairAction, "ui-1", "other-secret", "alice")).Message);
        Assert.Equal(AgentSessions.ChannelRefused, Assert.Throws<UserFacingException>(() =>
            f.Ui(SyncHandler.AgentUnpairAction, "ui-1", "secret-1", "mallory")).Message);
        // a missing or oversized id is refused like a foreign session
        Assert.Equal(AgentSessions.ChannelRefused,
            Assert.Throws<UserFacingException>(() => f.Open("", "secret-1", "alice")).Message);
        Assert.Equal(AgentSessions.ChannelRefused,
            Assert.Throws<UserFacingException>(() => f.Open(new string('x', 129), "secret-1", "alice")).Message);
        // _agent-pair needs a registered session
        Assert.Equal(AgentSessions.ChannelRefused, Assert.Throws<UserFacingException>(() =>
            f.Ui(SyncHandler.AgentPairAction, "ui-unknown", "secret", "alice")).Message);
    }

    [Fact]
    public void Too_many_failed_pairings_lock_the_caller_out_for_a_minute()
    {
        var f = new Fixture();
        f.Open("ui-1", "secret-1", null);
        var code = f.PairCode("ui-1", "secret-1", null);
        var agent = f.Mcp(AgentCaller.From(null, "an-agent-key-of-the-sidecar"));
        for (var i = 0; i < 10; i++)
            Assert.Equal(AgentSessions.InvalidCode, ToolError(agent, "mateu_pair_session", new() { ["code"] = "2222-2222" }));
        Assert.Equal(AgentSessions.TooManyAttempts, ToolError(agent, "mateu_pair_session", new() { ["code"] = code }));
        // another caller is not locked out; the code is case-insensitive and the dash optional
        var bob = f.Mcp(AgentCaller.From("bob", null));
        Assert.True(ToolOk(bob, "mateu_pair_session", new() { ["code"] = code.Replace("-", "").ToLowerInvariant() })["paired"]!.GetValue<bool>());
        f.Now = f.Now.AddSeconds(61);
        Assert.Equal(AgentSessions.InvalidCode, ToolError(agent, "mateu_pair_session", new() { ["code"] = code }));
    }

    [Fact]
    public void Every_anonymous_pairing_counts_on_its_own()
    {
        var f = new Fixture();
        var channel = f.Open("ui-1", "secret-1", null);
        var anon = f.Mcp(AgentCaller.Anonymous);
        ToolOk(anon, "mateu_pair_session", new() { ["code"] = f.PairCode("ui-1", "secret-1", null) });
        ToolOk(anon, "mateu_pair_session", new() { ["code"] = f.PairCode("ui-1", "secret-1", null) });
        var last = Drain(channel).Last();
        Same(JsonNode.Parse("""{"paired":true,"agents":["an agent","an agent"]}"""), last["detail"], "status");
    }

    [Fact]
    public void A_pairing_code_expires_after_300_seconds_and_a_new_one_kills_the_previous()
    {
        var f = new Fixture();
        f.Open("ui-1", "secret-1", null);
        var agent = f.Mcp(AgentCaller.From(null, "an-agent-key-of-the-sidecar"));
        var old = f.PairCode("ui-1", "secret-1", null);
        Assert.Matches("^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$", old);
        var code = f.PairCode("ui-1", "secret-1", null);
        Assert.Equal(AgentSessions.InvalidCode, ToolError(agent, "mateu_pair_session", new() { ["code"] = old }));
        f.Now = f.Now.AddSeconds(300);
        Assert.Equal(AgentSessions.InvalidCode, ToolError(agent, "mateu_pair_session", new() { ["code"] = code }));
    }

    [Fact]
    public void An_agent_key_identifies_a_caller_and_a_short_one_does_not()
    {
        var f = new Fixture();
        var handle = f.Open("ui-1", "secret-1", null).Session.Handle;
        var key = AgentCaller.From(null, "an-agent-key-of-the-sidecar");
        Assert.StartsWith("key:", key.Id);
        Assert.Null(AgentCaller.From(null, "short").Id);
        ToolOk(f.Mcp(key), "mateu_pair_session", new() { ["code"] = f.PairCode("ui-1", "secret-1", null) });
        Assert.Single(ToolOk(f.Mcp(key), "mateu_list_sessions", new())["sessions"]!.AsArray());
        // another key, and an anonymous caller, cannot reach a session paired to a key
        foreach (var stranger in new[] { AgentCaller.From(null, "another-agent-key-123"), AgentCaller.Anonymous })
            Assert.Equal(AgentSessions.UnknownSession(handle),
                ToolError(f.Mcp(stranger), "mateu_navigate", new() { ["session"] = handle, ["route"] = "/" }));
    }

    [Fact]
    public void The_senders_check_their_arguments_first()
    {
        var f = new Fixture();
        var handle = f.Open("ui-1", "secret-1", "alice").Session.Handle;
        var alice = f.Mcp(AgentCaller.From("alice", null));
        Assert.Equal("Missing argument \"session\".", ToolError(alice, "mateu_push_ui", new() { ["yaml"] = "type: Text\n" }));
        Assert.Equal("Missing argument \"yaml\".", ToolError(alice, "mateu_push_ui", new() { ["session"] = handle }));
        Assert.Equal("Missing argument \"route\".", ToolError(alice, "mateu_navigate", new() { ["session"] = handle }));
        Assert.Equal("Missing argument \"code\".", ToolError(alice, "mateu_pair_session", new()));
        // arguments before visibility
        Assert.Equal(AgentSessions.InvalidEvent("x y"), ToolError(alice, "mateu_dispatch_event", new() { ["session"] = "nope", ["event"] = "x y" }));
        var big = new JsonObject { ["text"] = new string('a', 70000) };
        Assert.Equal(AgentSessions.DetailTooLarge,
            ToolError(alice, "mateu_dispatch_event", new() { ["session"] = handle, ["event"] = "big", ["detail"] = big }));
        // a non-page definition is validated but not sent
        var notPage = ToolOk(alice, "mateu_push_ui", new() { ["session"] = handle, ["yaml"] = "[]\n" });
        Assert.False(notPage["delivered"]!.GetValue<bool>());
        Assert.Equal(AgentSessions.NotAPage, (string?)notPage["reason"]);
        Assert.Equal("routes", (string?)notPage["validation"]!["kind"]);
        // navigate sends only the optional fields given
        ToolOk(alice, "mateu_navigate", new() { ["session"] = handle, ["route"] = "/r", ["actionId"] = "go" });
        var nav = Drain(f.Sessions.Reachable(AgentCaller.From("alice", null), handle).Current!).Last();
        Same(JsonNode.Parse("""{"kind":"navigate","event":"navigation-requested","detail":{"route":"/r","consumedRoute":"","actionId":"go"}}"""), nav, "navigate");
    }

    // ── over HTTP ────────────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task A_pushed_screen_reaches_the_open_channel_over_the_real_sse_endpoint()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:21560");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(o =>
        {
            o.Mcp = true;
            o.McpPush = true;
        }, typeof(AgentPushTests).Assembly);
        var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        try
        {
            using var http = new HttpClient { BaseAddress = new Uri("http://127.0.0.1:21560"), Timeout = TimeSpan.FromSeconds(30) };
            string Body(string action) => JsonSerializer.Serialize(new
            {
                actionId = action, route = "",
                parameters = new { sessionId = "tab-1", secret = "tab-secret", route = "/", renderer = "vaadin" },
            });

            using var rq = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sse/")
            {
                Content = new StringContent(Body(SyncHandler.AgentChannelAction), Encoding.UTF8, "application/json"),
            };
            using var stream = await http.SendAsync(rq, HttpCompletionOption.ResponseHeadersRead);
            Assert.Equal("text/event-stream", stream.Content.Headers.ContentType?.MediaType);
            using var reader = new StreamReader(await stream.Content.ReadAsStreamAsync());

            async Task<JsonNode> NextEvent()
            {
                while (true)
                {
                    var line = await reader.ReadLineAsync().WaitAsync(TimeSpan.FromSeconds(20));
                    Assert.NotNull(line);
                    if (line!.StartsWith("data: ")) return JsonNode.Parse(line["data: ".Length..])!;
                }
            }

            var status = await NextEvent();
            Assert.Equal("AgentPush", (string)status["commands"]![0]!["type"]!);
            Assert.Equal("status", (string)status["commands"]![0]!["data"]!["kind"]!);

            // the UI asks for a code on the sync endpoint; the sidecar redeems it with its agent key
            var paired = await http.PostAsync("/mateu/v3/sync/",
                new StringContent(Body(SyncHandler.AgentPairAction), Encoding.UTF8, "application/json"));
            var pairing = JsonNode.Parse(await paired.Content.ReadAsStringAsync())!["fragments"]![0]!["data"]!["_agentPairing"]!;
            var code = (string)pairing["code"]!;

            async Task<JsonNode> Mcp(string tool, JsonObject args)
            {
                using var call = new HttpRequestMessage(HttpMethod.Post, "/mateu/mcp")
                {
                    Content = new StringContent(new JsonObject
                    {
                        ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = "tools/call",
                        ["params"] = new JsonObject { ["name"] = tool, ["arguments"] = args },
                    }.ToJsonString(), Encoding.UTF8, "application/json"),
                };
                call.Headers.Add(AgentCaller.AgentKeyHeader, "sidecar-key-0123456789");
                var response = await http.SendAsync(call);
                var result = JsonNode.Parse(await response.Content.ReadAsStringAsync())!["result"]!;
                Assert.True(result["isError"] is null, result.ToJsonString());
                return JsonNode.Parse((string)result["content"]![0]!["text"]!)!;
            }

            var session = (string)(await Mcp("mateu_pair_session", new() { ["code"] = code }))["session"]!;
            Assert.Equal("an agent", (string)(await NextEvent())["commands"]![0]!["data"]!["detail"]!["agents"]![0]!);
            var pushed = await Mcp("mateu_push_ui", new() { ["session"] = session, ["yaml"] = "type: Text\ntext: Hello\n" });
            Assert.True(pushed["delivered"]!.GetValue<bool>());

            var render = (await NextEvent())["commands"]![0]!["data"]!;
            Same(JsonNode.Parse("""{"kind":"render","event":"render-screen","detail":{"yaml":"type: Text\ntext: Hello\n","target":"content"}}"""),
                render, "the pushed screen");
        }
        finally
        {
            await app.StopAsync();
            await app.DisposeAsync();
            MateuLogging.UseLoggerFactory(null);
        }
    }
}
