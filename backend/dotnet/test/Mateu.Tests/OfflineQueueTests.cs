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

[UI("offline-count"), Title("Stock count")]
public class OfflineStockCount
{
    public static int Runs;

    public int Counted { get; set; }

    [Button, ActionOptions(Offline = OfflinePolicy.Queue)]
    public string Save() => "Saved " + Interlocked.Increment(ref Runs);

    [Button]
    public string Other() => "Other " + Interlocked.Increment(ref Runs);

    [Button]
    public string Fail()
    {
        Interlocked.Increment(ref Runs);
        throw new InvalidOperationException("boom");
    }

    [Button, ActionOptions(Offline = OfflinePolicy.Queue), DisabledUnless(Permissions = ["stock.write"])]
    public string Guarded() => "Guarded " + Interlocked.Increment(ref Runs);
}

/// <summary>The offline send queue's server contract (mirrors Java's OfflineQueueSyncTest):
/// [ActionOptions(Offline = Queue)] travels as <c>offline: "queue"</c>, and an Idempotency-Key runs
/// once per caller, action and key over the real sync endpoint.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class OfflineQueueTests
{
    [Fact]
    public void The_offline_policy_travels_on_the_action_dto()
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(OfflineStockCount).Assembly)).Handle(new RunActionRqDto
        {
            Route = "offline-count", ConsumedRoute = "offline-count", ServerSideType = typeof(OfflineStockCount).FullName,
            ActionId = "", InitiatorComponentId = "c1", Parameters = new(), ComponentState = new(),
        });
        var actions = ((ServerSideComponentDto)inc.Fragments[0].Component!).Actions;
        Assert.Equal("queue", actions.Single(a => a.Id == "save").Offline);
        Assert.Null(actions.Single(a => a.Id == "other").Offline);
        Assert.DoesNotContain("offline", JsonSerializer.Serialize(actions.Single(a => a.Id == "other"),
            new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }

    [Fact]
    public async Task An_idempotency_key_runs_once_per_caller_action_and_key()
    {
        IdempotencyKeys.Clear();
        OfflineStockCount.Runs = 0;
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(OfflineQueueTests).Assembly);
        await using var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) };

        async Task<string> Send(string actionId, string? key)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/offline-count")
            {
                Content = new StringContent(JsonSerializer.Serialize(new
                {
                    serverSideType = typeof(OfflineStockCount).FullName, route = "offline-count",
                    consumedRoute = "offline-count", actionId, initiatorComponentId = "c1",
                    componentState = new { counted = 3 },
                }), System.Text.Encoding.UTF8, "application/json"),
            };
            if (key is not null) request.Headers.Add(IdempotencyKeys.Header, key);
            return await (await http.SendAsync(request)).Content.ReadAsStringAsync();
        }

        Assert.Contains("Saved 1", await Send("save", "key-0001-aaaa"));
        Assert.Contains("Saved 1", await Send("save", "key-0001-aaaa")); // replayed, not run
        Assert.Equal(1, OfflineStockCount.Runs);
        Assert.Contains("Saved 2", await Send("save", "key-0002-bbbb"));
        Assert.Contains("Other 3", await Send("other", "key-0001-aaaa")); // scoped to the action
        Assert.Contains("Saved 4", await Send("save", null));
        Assert.Contains("Saved 5", await Send("save", "short")); // malformed: ignored
        Assert.Contains("Saved 6", await Send("save", "short"));
        Assert.Equal(6, OfflineStockCount.Runs);
        // a failed run is forgotten: the same key runs again
        var failed = await Send("fail", "key-0003-cccc");
        Assert.True(failed.Contains("\"error\""), failed);
        Assert.Equal(7, OfflineStockCount.Runs);
        Assert.Contains("\"error\"", await Send("fail", "key-0003-cccc"));
        Assert.True(OfflineStockCount.Runs == 8, "runs " + OfflineStockCount.Runs + " " + failed);
        IdempotencyKeys.Clear();
    }

    [Fact]
    public async Task A_repeat_arriving_while_the_first_run_is_in_flight_joins_it()
    {
        IdempotencyKeys.Clear();
        var runs = 0;
        var gate = new TaskCompletionSource();
        Task<UIIncrementDto> Run() => Task.Run(async () =>
        {
            Interlocked.Increment(ref runs);
            await gate.Task;
            return UIIncrementDto.Of();
        });
        var first = IdempotencyKeys.OnceAsync("u", "save", "key-0009-zzzz", Run);
        var second = IdempotencyKeys.OnceAsync("u", "save", "key-0009-zzzz", Run);
        var otherCaller = IdempotencyKeys.OnceAsync("v", "save", "key-0009-zzzz", Run);
        gate.SetResult();
        await Task.WhenAll(first, second, otherCaller);
        Assert.Same(first, second);
        Assert.Equal(2, runs);
        IdempotencyKeys.Clear();
    }
    private const string Anonymous = "name=\u0001roles=\u0001groups=\u0001scopes=\u0001permissions=";

    [Fact]
    public void An_idempotency_key_is_scoped_to_the_callers_complete_identity()
    {
        static Microsoft.AspNetCore.Http.HttpContext As(System.Security.Claims.ClaimsIdentity identity) =>
            new Microsoft.AspNetCore.Http.DefaultHttpContext { User = new System.Security.Claims.ClaimsPrincipal(identity) };
        var anonymous = new Microsoft.AspNetCore.Http.DefaultHttpContext();
        Assert.Equal(Anonymous, MateuExtensions.CallerOf(anonymous));
        var ann = As(new System.Security.Claims.ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "ann"),
            new System.Security.Claims.Claim("roles", "staff"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, "admin"),
            new System.Security.Claims.Claim("role", "clerk"),
            new System.Security.Claims.Claim("groups", "emea"),
            new System.Security.Claims.Claim("scope", "orders.write orders.read"),
            new System.Security.Claims.Claim("permissions", "approve"),
            new System.Security.Claims.Claim("email", "ignored"),
        }, "test"));
        Assert.Equal("name=ann\u0001roles=admin\u0003clerk\u0003staff\u0001groups=emea"
                     + "\u0001scopes=orders.read\u0003orders.write\u0001permissions=approve",
            MateuExtensions.CallerOf(ann));
        // claims of an unauthenticated identity name nobody
        var unauthenticated = As(new System.Security.Claims.ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "bob"),
        }));
        Assert.Equal(Anonymous, MateuExtensions.CallerOf(unauthenticated));
    }

    [Fact]
    public void The_caller_scope_changes_when_only_groups_scopes_or_permissions_differ()
    {
        var callers = new[]
        {
            IdempotencyKeys.CallerOf("ana", new Identity(Roles: ["clerk"])),
            IdempotencyKeys.CallerOf("ana", new Identity(Roles: ["clerk"], Groups: ["g"])),
            IdempotencyKeys.CallerOf("ana", new Identity(Roles: ["clerk"], Scopes: ["s"])),
            IdempotencyKeys.CallerOf("ana", new Identity(Roles: ["clerk"], Permissions: ["p"])),
        };
        Assert.Equal(4, callers.Distinct().Count());
        // canonical: the order of the grants does not matter; the identity's own name wins
        Assert.Equal(IdempotencyKeys.CallerOf(null, new Identity(Roles: ["b", "a"]) { Name = "ana" }),
            IdempotencyKeys.CallerOf("someone-else", new Identity(Roles: ["a", "b"]) { Name = "ana" }));
    }

    [Fact]
    public async Task A_run_in_flight_is_never_evicted_a_full_table_refuses_a_new_key()
    {
        IdempotencyKeys.Clear();
        var previous = IdempotencyKeys.MaxEntries;
        IdempotencyKeys.MaxEntries = 1;
        try
        {
            var runs = new List<string>();
            var gate = new TaskCompletionSource();
            Func<Task<UIIncrementDto>> Slow(string label) => () => Task.Run(async () =>
            {
                lock (runs) runs.Add(label);
                await gate.Task;
                return UIIncrementDto.Of();
            });
            var a = IdempotencyKeys.OnceAsync("u", "save", "key-A-000001", Slow("original"));
            // B arrives while A is in flight and the table is full: refused, A untouched
            var b = IdempotencyKeys.OnceAsync("u", "save", "key-B-000002", Slow("b"));
            var refusal = await Assert.ThrowsAsync<UserFacingException>(() => b);
            Assert.Equal(IdempotencyKeys.BusyTitle, refusal.Title);
            Assert.Equal(1, IdempotencyKeys.InFlightCount);
            // a retry of A joins A: never a second execution
            var retry = IdempotencyKeys.OnceAsync("u", "save", "key-A-000001", Slow("duplicate"));
            Assert.Same(a, retry);
            gate.SetResult();
            await Task.WhenAll(a, retry);
            Assert.Equal(new[] { "original" }, runs);
            Assert.Equal(0, IdempotencyKeys.InFlightCount);
            // once A finished, B is admitted
            await IdempotencyKeys.OnceAsync("u", "save", "key-B-000002", () => Task.FromResult(UIIncrementDto.Of()));
        }
        finally
        {
            IdempotencyKeys.MaxEntries = previous;
            IdempotencyKeys.Clear();
        }
    }

    [Fact]
    public async Task A_late_completion_never_removes_a_newer_run_of_the_same_key()
    {
        IdempotencyKeys.Clear();
        var runs = 0;
        var oldGate = new TaskCompletionSource();
        var newGate = new TaskCompletionSource();
        Func<Task<UIIncrementDto>> Gated(TaskCompletionSource gate) => () => Task.Run(async () =>
        {
            Interlocked.Increment(ref runs);
            await gate.Task;
            return UIIncrementDto.Of();
        });
        var old = IdempotencyKeys.OnceAsync("u", "save", "key-C-000003", Gated(oldGate));
        IdempotencyKeys.Clear(); // the old run's entry goes, a newer run takes the key
        var newer = IdempotencyKeys.OnceAsync("u", "save", "key-C-000003", Gated(newGate));
        oldGate.SetResult();
        await old;
        Assert.Equal(1, IdempotencyKeys.InFlightCount);
        Assert.Same(newer, IdempotencyKeys.OnceAsync("u", "save", "key-C-000003", Gated(newGate)));
        newGate.SetResult();
        await newer;
        Assert.Equal(2, runs);
        IdempotencyKeys.Clear();
    }

    [Fact]
    public async Task Two_users_of_a_custom_identity_and_a_revoked_permission_never_replay()
    {
        IdempotencyKeys.Clear();
        OfflineStockCount.Runs = 0;
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        // the app's own identity: user + permissions its gateway put in headers — never HttpContext.User
        builder.Services.AddMateu(o => o.Identity = ctx => ctx.Request.Headers["X-App-User"] is { Count: > 0 } user
            ? new Identity(Permissions: ctx.Request.Headers["X-App-Permissions"] is { Count: > 0 } p
                ? p.ToString().Split(',') : []) { Name = user.ToString() }
            : null, typeof(OfflineQueueTests).Assembly);
        await using var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) };

        async Task<(int Status, string Body)> Send(string actionId, string user, string key, string? permissions = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/offline-count")
            {
                Content = new StringContent(JsonSerializer.Serialize(new
                {
                    serverSideType = typeof(OfflineStockCount).FullName, route = "offline-count",
                    consumedRoute = "offline-count", actionId, initiatorComponentId = "c1",
                    componentState = new { counted = 3 },
                }), System.Text.Encoding.UTF8, "application/json"),
            };
            request.Headers.Add(IdempotencyKeys.Header, key);
            request.Headers.Add("X-App-User", user);
            if (permissions is not null) request.Headers.Add("X-App-Permissions", permissions);
            var response = await http.SendAsync(request);
            return ((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }

        // two users, same key, same action: each runs and gets its own answer
        Assert.Contains("Saved 1", (await Send("save", "alice", "key-0010-same")).Body);
        Assert.Contains("Saved 2", (await Send("save", "bob", "key-0010-same")).Body);
        Assert.Equal(2, OfflineStockCount.Runs);
        // same user, permission revoked between the two: refused, not served from memory
        Assert.Contains("Guarded 3", (await Send("guarded", "alice", "key-0011-same", "stock.write")).Body);
        var revoked = await Send("guarded", "alice", "key-0011-same");
        Assert.DoesNotContain("Guarded 3", revoked.Body);
        Assert.True(revoked.Status == 403 || revoked.Body.Contains("\"error\""), revoked.Body);
        Assert.Equal(3, OfflineStockCount.Runs);
        IdempotencyKeys.Clear();
    }
}

