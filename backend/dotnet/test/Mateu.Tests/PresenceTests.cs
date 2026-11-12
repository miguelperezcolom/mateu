using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// Record presence ([App(Presence = true)]) — mirrors Java's PresenceSyncTest and PresenceTest.

[UI("presence-desk")]
[App("Desk", Presence = true)]
public class PresenceDeskApp;

[UI("presence-other")]
[App("Other desk", Presence = true)]
public class PresenceOtherApp;

[UI("presence-off")]
[App("Plain desk")]
public class PresenceOffApp;

[Collection(ProcessWideStateCollection.Name)]
public class PresenceTests
{
    private const string View = "io.example.OrderView";

    // each test its own store: the default one is process-wide
    private readonly InMemoryPresenceStore _store = new();

    private SyncHandler Handler(string? principal) =>
        new(new MateuRegistry(typeof(PresenceTests).Assembly)) { Principal = () => principal, PresenceStore = _store };

    private PresenceDto? Report(Type app, string? who, string tab, string route, string state)
    {
        var increment = Handler(who).Handle(new RunActionRqDto
        {
            ServerSideType = app.FullName, Route = "/" + app.Name, ActionId = Presence.ActionId,
            Parameters = new Dictionary<string, object?> { ["route"] = route, ["view"] = View, ["tab"] = tab, ["state"] = state },
        });
        return increment.Commands.Where(c => c.Type == "PresenceChanged").Select(c => (PresenceDto)c.Data!).FirstOrDefault();
    }

    [Fact]
    public void The_app_says_whether_presence_is_on()
    {
        Assert.True(((AppMetadataDto)new ReflectionMapper().MapApp(typeof(PresenceDeskApp)).Metadata).Presence);
        Assert.False(((AppMetadataDto)new ReflectionMapper().MapApp(typeof(PresenceOffApp)).Metadata).Presence);
    }

    [Fact]
    public void Each_one_sees_the_others_and_who_edits()
    {
        Report(typeof(PresenceDeskApp), "ana", "a", "orders/7", "viewing");
        Report(typeof(PresenceDeskApp), "bob", "b", "orders/7/edit", "editing");
        var seenByAna = Report(typeof(PresenceDeskApp), "ana", "a", "/orders/7", "viewing")!;
        Assert.Equal("orders/7|" + View, seenByAna.Key);
        var bob = Assert.Single(seenByAna.Entries);
        Assert.Equal(("bob", true), (bob.Name, bob.Editing));
        Assert.False(string.IsNullOrEmpty(bob.Since));
        var ana = Assert.Single(Report(typeof(PresenceDeskApp), "bob", "b", "orders/7/edit", "editing")!.Entries);
        Assert.Equal(("ana", false), (ana.Name, ana.Editing));
    }

    [Fact]
    public void One_person_in_two_tabs_is_one_entry_editing_if_any_tab_edits()
    {
        Report(typeof(PresenceDeskApp), "ana", "1", "orders/8", "viewing");
        Report(typeof(PresenceDeskApp), "ana", "2", "orders/8", "editing");
        Assert.True(Assert.Single(Report(typeof(PresenceDeskApp), "bob", "b", "orders/8", "viewing")!.Entries).Editing);
    }

    [Fact]
    public void Another_record_or_another_app_never_sees_it()
    {
        Report(typeof(PresenceDeskApp), "ana", "a", "orders/9", "editing");
        Assert.Empty(Report(typeof(PresenceDeskApp), "bob", "b", "orders/10", "viewing")!.Entries);
        Assert.Empty(Report(typeof(PresenceOtherApp), "bob", "c", "orders/9", "viewing")!.Entries);
    }

    [Fact]
    public void Anonymous_callers_neither_show_nor_see()
    {
        Report(typeof(PresenceDeskApp), "ana", "a", "orders/11", "viewing");
        Assert.Null(Report(typeof(PresenceDeskApp), null, "x", "orders/11", "editing"));
        Assert.Equal(["ana"], Report(typeof(PresenceDeskApp), "bob", "b", "orders/11", "viewing")!.Entries.Select(e => e.Name));
    }

    [Fact]
    public void A_create_page_and_an_app_without_presence_take_no_part()
    {
        Assert.Null(Report(typeof(PresenceDeskApp), "ana", "a", "orders/new", "editing"));
        Assert.Null(Report(typeof(PresenceOffApp), "ana", "a", "orders/12", "viewing"));
    }

    [Fact]
    public void Leaving_takes_the_tab_off()
    {
        Report(typeof(PresenceDeskApp), "ana", "a", "orders/13", "editing");
        Report(typeof(PresenceDeskApp), "ana", "a", "orders/13", "leave");
        Assert.Empty(Report(typeof(PresenceDeskApp), "bob", "b", "orders/13", "viewing")!.Entries);
    }

    [Fact]
    public void A_record_is_its_route_and_view_class()
    {
        Assert.Equal("orders/7|x.V", Presence.RecordOf("orders/7/view?tab=2", "x.V"));
        Assert.Equal("orders/7|", Presence.RecordOf("//orders//7/", null));
        Assert.Null(Presence.RecordOf("orders/new", "x.V"));
        Assert.Null(Presence.RecordOf("/", "x.V"));
        Assert.Null(Presence.RecordOf(new string('a', 600), "x.V"));
    }

    [Fact]
    public void A_tab_not_seen_for_thirty_seconds_is_gone()
    {
        var clock = Presence.Clock;
        var t0 = DateTimeOffset.Parse("2026-11-11T10:00:00Z");
        try
        {
            Presence.Clock = () => t0;
            Presence.Touch(_store, "s", "r|", "ana", "t", false);
            Presence.Clock = () => t0.AddSeconds(25);
            Assert.Single(Presence.Snapshot(_store, "s", "r|", "bob").Entries);
            Presence.Clock = () => t0.AddSeconds(31);
            Assert.Empty(Presence.Snapshot(_store, "s", "r|", "bob").Entries);
            Presence.ResetSweep();
            Presence.Sweep(_store);
            Assert.Equal(0, _store.Count);
        }
        finally
        {
            Presence.Clock = clock;
            Presence.ResetSweep();
        }
    }

    [Fact]
    public void The_store_is_bounded()
    {
        var store = new InMemoryPresenceStore();
        var now = DateTimeOffset.UtcNow;
        PresenceMember M(string p) => new(p, p, "t", false, now, now);
        for (var i = 0; i < InMemoryPresenceStore.MaxMembersPerRecord; i++) Assert.True(store.Touch("s", "r", M("p" + i)));
        Assert.False(store.Touch("s", "r", M("one-too-many")));
        Assert.True(store.Touch("s", "r", M("p0")));
        for (var i = 0; i < InMemoryPresenceStore.MaxCopiesPerPrincipal; i++) Assert.True(store.Touch("s", "rec" + i, M("busy")));
        Assert.False(store.Touch("s", "one-more", M("busy")));
        store.Leave("s", "rec0", "busy", "t");
        Assert.True(store.Touch("s", "one-more", M("busy")));
    }

    [Fact]
    public void Listeners_hear_joins_edits_leaves_and_expiries()
    {
        var store = new InMemoryPresenceStore();
        var now = DateTimeOffset.UtcNow;
        var heard = new List<string>();
        using (store.OnChange((scope, record) => heard.Add(scope + "/" + record)))
        {
            store.Touch("s", "r", new("ana", "ana", "t", false, now, now));
            store.Touch("s", "r", new("ana", "ana", "t", false, now, now)); // a heartbeat: no change
            store.Touch("s", "r", new("ana", "ana", "t", true, now, now));
            store.Leave("s", "r", "ana", "t");
            store.Touch("s", "r2", new("bob", "bob", "t", false, now, now));
            store.Expire(now.AddSeconds(60));
        }
        Assert.Equal(["s/r", "s/r", "s/r", "s/r2", "s/r2"], heard);
        Assert.Equal(0, store.Count);
    }

    [Fact]
    public async Task Over_http_the_live_updates_stream_carries_the_changes_of_a_record_the_caller_has_open()
    {
        var heartbeat = MateuExtensions.LiveUpdatesHeartbeat;
        MateuExtensions.LiveUpdatesHeartbeat = TimeSpan.FromMilliseconds(200); // the heartbeat also sweeps
        try
        {
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseUrls("http://127.0.0.1:0");
            builder.Services.AddSingleton<IPresenceStore>(_store);
            builder.Services.AddMateu(typeof(PresenceTests).Assembly);
            await using var app = builder.Build();
            // the host authenticates; Mateu only reads the principal
            app.Use(async (ctx, next) =>
            {
                if (ctx.Request.Headers.TryGetValue("X-Test-User", out var user))
                    ctx.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, user.ToString())], "test"));
                await next();
            });
            app.MapMateu();
            await app.StartAsync();
            var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
            using var http = new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) };
            HttpRequestMessage Post(string path, string who, object body)
            {
                var rq = new HttpRequestMessage(HttpMethod.Post, path)
                {
                    Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"),
                };
                rq.Headers.Add("X-Test-User", who);
                return rq;
            }
            object Report(string tab, string state) => new
            {
                serverSideType = typeof(PresenceDeskApp).FullName, route = "/presence-desk", actionId = Presence.ActionId,
                parameters = new Dictionary<string, object?> { ["route"] = "orders/21", ["view"] = View, ["tab"] = tab, ["state"] = state },
            };

            (await http.SendAsync(Post("/mateu/v3/sync/presence-desk", "ana", Report("a", "viewing")))).EnsureSuccessStatusCode();
            using var response = await http.SendAsync(Post("/mateu/v3/sse/presence-desk", "ana", new
            {
                serverSideType = typeof(PresenceDeskApp).FullName, route = "/presence-desk", actionId = "_live-updates",
            }), HttpCompletionOption.ResponseHeadersRead);
            using var reader = new StreamReader(await response.Content.ReadAsStreamAsync());
            await NextData(reader); // the catch-up
            (await http.SendAsync(Post("/mateu/v3/sync/presence-desk", "bob", Report("b", "editing")))).EnsureSuccessStatusCode();
            string change;
            do change = await NextData(reader); while (change != "" && !change.Contains("PresenceChanged"));
            Assert.Contains("\"PresenceChanged\"", change);
            Assert.Contains("\"bob\"", change);
            reader.Dispose();
            response.Dispose(); // the browser goes away: the stream and its subscriptions end
            await app.StopAsync();
        }
        finally
        {
            MateuExtensions.LiveUpdatesHeartbeat = heartbeat;
        }
    }

    private static async Task<string> NextData(StreamReader reader)
    {
        string? line;
        do line = await reader.ReadLineAsync(); while (line is not null && !line.StartsWith("data:"));
        return line ?? "";
    }
}
