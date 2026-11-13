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

    private static Task<UIIncrementDto> SaveToggle(SyncHandler handler, string key) =>
        IdempotencyKeys.GuardedAsync("u", "save", key, () => handler.HandleAsync(new RunActionRqDto
        {
            Route = "offline-toggle-parts/p1", ConsumedRoute = "offline-toggle-parts/p1", ActionId = "save",
            ServerSideType = typeof(OfflineToggleParts).FullName, InitiatorComponentId = "c1",
            ComponentState = new() { ["id"] = "p1", ["name"] = "Renamed" },
        }), view: typeof(OfflineToggleParts).FullName, route: "offline-toggle-parts/p1");

    [Fact]
    public async Task The_key_is_scoped_to_the_view()
    {
        IdempotencyKeys.Clear();
        OfflineToggleParts.Reset();
        OfflineStockCount.Runs = 0;
        var handler = new SyncHandler(new MateuRegistry(typeof(OfflineToggleParts).Assembly));
        Task<UIIncrementDto> SaveCount() => IdempotencyKeys.GuardedAsync("u", "save", "key-0015-same",
            () => handler.HandleAsync(new RunActionRqDto
            {
                Route = "offline-count", ConsumedRoute = "offline-count", ActionId = "save",
                ServerSideType = typeof(OfflineStockCount).FullName, InitiatorComponentId = "c1",
                ComponentState = new() { ["counted"] = 3 },
            }), view: typeof(OfflineStockCount).FullName, route: "/offline-count");
        // same caller, same key, same action id — two views: two runs
        await SaveCount();
        await SaveToggle(handler, "key-0015-same");
        Assert.Equal(1, OfflineStockCount.Runs);
        Assert.Equal(1, OfflineToggleParts.Saves);
        // each view replays its own
        await SaveCount();
        await SaveToggle(handler, "key-0015-same");
        Assert.Equal(1, OfflineStockCount.Runs);
        Assert.Equal(1, OfflineToggleParts.Saves);
        OfflineToggleParts.Reset();
        IdempotencyKeys.Clear();
    }

    private static Func<Task<UIIncrementDto>> Counting(Action count, UIIncrementDto? answer = null) => () =>
    {
        count();
        return Task.FromResult(answer ?? UIIncrementDto.Of());
    };

    [Fact]
    public async Task A_finished_answer_is_replayed_until_its_ttl_expires()
    {
        IdempotencyKeys.Clear();
        var previous = IdempotencyKeys.Ttl;
        var runs = 0;
        try
        {
            var first = await IdempotencyKeys.OnceAsync("u", "save", "key-0020-ttl0", Counting(() => runs++));
            var replayed = await IdempotencyKeys.OnceAsync("u", "save", "key-0020-ttl0", Counting(() => runs++));
            Assert.Same(first, replayed);
            Assert.Equal(1, runs);
            // past its TTL the answer is forgotten: the key runs again
            IdempotencyKeys.Ttl = TimeSpan.Zero;
            await Task.Delay(5);
            await IdempotencyKeys.OnceAsync("u", "save", "key-0020-ttl0", Counting(() => runs++));
            Assert.Equal(2, runs);
        }
        finally
        {
            IdempotencyKeys.Ttl = previous;
            IdempotencyKeys.Clear();
        }
    }

    [Fact]
    public async Task A_checkpoint_past_the_ttl_runs_the_action_again()
    {
        IdempotencyKeys.Clear();
        var previous = IdempotencyKeys.Ttl;
        var runs = 0;
        Task<UIIncrementDto> Guarded() => IdempotencyKeys.GuardedAsync("u", "save", "key-0021-ttl0", () =>
        {
            IdempotencyKeys.Checkpoint();
            runs++;
            return Task.FromResult(UIIncrementDto.Of());
        });
        try
        {
            await Guarded();
            await Guarded();
            Assert.Equal(1, runs);
            IdempotencyKeys.Ttl = TimeSpan.Zero;
            await Task.Delay(5);
            await Guarded();
            Assert.Equal(2, runs);
        }
        finally
        {
            IdempotencyKeys.Ttl = previous;
            IdempotencyKeys.Clear();
        }
    }

    [Fact]
    public async Task A_failed_run_and_an_error_answer_are_forgotten()
    {
        IdempotencyKeys.Clear();
        var runs = 0;
        async Task<UIIncrementDto> Failing()
        {
            await Task.Yield();
            runs++;
            throw new InvalidOperationException("boom");
        }
        await Assert.ThrowsAsync<InvalidOperationException>(() => IdempotencyKeys.OnceAsync("u", "save", "key-0022-fail", Failing));
        await Assert.ThrowsAsync<InvalidOperationException>(() => IdempotencyKeys.OnceAsync("u", "save", "key-0022-fail", Failing));
        Assert.Equal(2, runs);
        Assert.Equal(0, IdempotencyKeys.InFlightCount);
        // an answer carrying an error message (a refusal) is not remembered either
        var refusal = UIIncrementDto.Of(messages: [new MessageDto("error", null, "Error", "Refused", 0)]);
        await IdempotencyKeys.OnceAsync("u", "save", "key-0023-refd", Counting(() => runs++, refusal));
        await IdempotencyKeys.OnceAsync("u", "save", "key-0023-refd", Counting(() => runs++, refusal));
        Assert.Equal(4, runs);
        IdempotencyKeys.Clear();
    }

    [Fact]
    public async Task A_failed_guarded_run_fails_its_joiners_and_is_forgotten()
    {
        IdempotencyKeys.Clear();
        var gate = new TaskCompletionSource();
        var runs = 0;
        Task<UIIncrementDto> Failing() => IdempotencyKeys.GuardedAsync("u", "save", "key-0024-join", async () =>
        {
            IdempotencyKeys.Checkpoint();
            runs++;
            await gate.Task;
            throw new InvalidOperationException("boom");
        });
        var first = Failing();
        // a repeat while the first is in flight joins it — and gets its failure
        var joiner = IdempotencyKeys.GuardedAsync("u", "save", "key-0024-join", () =>
        {
            IdempotencyKeys.Checkpoint();
            runs++;
            return Task.FromResult(UIIncrementDto.Of());
        });
        gate.SetResult();
        await Assert.ThrowsAsync<InvalidOperationException>(() => first);
        await Assert.ThrowsAsync<InvalidOperationException>(() => joiner);
        Assert.Equal(1, runs);
        Assert.Equal(0, IdempotencyKeys.InFlightCount);
        IdempotencyKeys.Clear();
    }

    [Fact]
    public async Task A_capability_listings_keyed_delete_and_restore_run_once()
    {
        // the capability writes claim the key at their checkpoint (AfterCheckpoint): a repeat of
        // a keyed delete / restore answers from memory instead of deleting / restoring twice
        IdempotencyKeys.Clear();
        OfflineRestorableBooks.Deletes = 0;
        OfflineRestorableBooks.Restores = 0;
        var handler = new SyncHandler(new MateuRegistry(typeof(OfflineRestorableBooks).Assembly));
        Task<UIIncrementDto> Send(string actionId, string key, Dictionary<string, object?> state,
            Dictionary<string, object?>? parameters = null) =>
            IdempotencyKeys.GuardedAsync("u", actionId, key, () => handler.HandleAsync(new RunActionRqDto
            {
                Route = "offline-restorable-books", ConsumedRoute = "offline-restorable-books", ActionId = actionId,
                ServerSideType = typeof(OfflineRestorableBooks).FullName, InitiatorComponentId = "c1",
                ComponentState = state, Parameters = parameters ?? new(),
            }), view: typeof(OfflineRestorableBooks).FullName, route: "offline-restorable-books");
        var selected = new Dictionary<string, object?>
        {
            ["crud_selected_items"] = JsonSerializer.SerializeToElement(new[] { new { id = "b1" } }),
        };
        var first = await Send("delete", "key-0025-dele", selected);
        var again = await Send("delete", "key-0025-dele", selected);
        Assert.Equal(1, OfflineRestorableBooks.Deletes);
        Assert.Equal(first.Messages.Single().Text, again.Messages.Single().Text);
        var restoreIds = new Dictionary<string, object?>
        {
            [IRestorable<string>.RestoreIds] = JsonSerializer.SerializeToElement(new[] { "b1" }),
        };
        await Send(IRestorable<string>.RestoreAction, "key-0026-rest", new(), restoreIds);
        await Send(IRestorable<string>.RestoreAction, "key-0026-rest", new(), restoreIds);
        Assert.Equal(1, OfflineRestorableBooks.Restores);
        IdempotencyKeys.Clear();
    }

    [Fact]
    public void The_view_normalisation_keeps_inner_slashes_and_case()
    {
        Assert.Equal("type=A.b\u0001route=Orders//7", IdempotencyKeys.ViewOf("\tA.b\n", "///Orders//7///"));
        Assert.NotEqual(IdempotencyKeys.ViewOf("a.B", "orders"), IdempotencyKeys.ViewOf("a.b", "orders"));
        Assert.Equal("type=\u0001route=", IdempotencyKeys.ViewOf("  ", " / "));
    }

    [Fact]
    public void The_view_is_normalised_like_in_the_other_backends()
    {
        Assert.Equal(IdempotencyKeys.ViewOf("a.B", "orders/7/edit"), IdempotencyKeys.ViewOf(" a.B ", "/orders/7/edit/"));
        Assert.Equal("type=a.B\u0001route=orders/7/edit", IdempotencyKeys.ViewOf("a.B", "orders/7/edit"));
        Assert.Equal("type=\u0001route=", IdempotencyKeys.ViewOf(null, null));
    }

    [Fact]
    public async Task A_replay_refused_by_a_non_identity_rule_is_refused_not_served_from_memory()
    {
        // the crud's write gate is app logic, not identity: the caller scope is the same, so only
        // looking the key up AFTER the gate keeps the remembered answer from being handed out
        IdempotencyKeys.Clear();
        OfflineToggleParts.Reset();
        var handler = new SyncHandler(new MateuRegistry(typeof(OfflineToggleParts).Assembly));
        await SaveToggle(handler, "key-0012-same");
        Assert.Equal(1, OfflineToggleParts.Saves);
        OfflineToggleParts.Editable = false;
        await Assert.ThrowsAnyAsync<MateuForbiddenException>(() => SaveToggle(handler, "key-0012-same"));
        Assert.Equal(0, IdempotencyKeys.InFlightCount);
        // the gate allowing it again: the same key answers from memory, the save does not run again
        OfflineToggleParts.Editable = true;
        await SaveToggle(handler, "key-0012-same");
        Assert.Equal(1, OfflineToggleParts.Saves);
        IdempotencyKeys.Clear();
    }

    [Fact]
    public async Task A_request_refused_before_its_checkpoint_never_claims_the_key()
    {
        IdempotencyKeys.Clear();
        OfflineToggleParts.Reset();
        OfflineToggleParts.Editable = false;
        var handler = new SyncHandler(new MateuRegistry(typeof(OfflineToggleParts).Assembly));
        await Assert.ThrowsAnyAsync<MateuForbiddenException>(() => SaveToggle(handler, "key-0013-same"));
        Assert.Equal(0, IdempotencyKeys.InFlightCount);
        OfflineToggleParts.Editable = true;
        await SaveToggle(handler, "key-0013-same");
        Assert.Equal(1, OfflineToggleParts.Saves);
        OfflineToggleParts.Reset();
        IdempotencyKeys.Clear();
    }
}

public class OfflineTogglePart
{
    [Id] public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

/// <summary>A capability listing that deletes and restores (counted), for the keyed-write tests.</summary>
[UI("offline-restorable-books"), Title("Restorable Books")]
public class OfflineRestorableBooks : IListing<CapBook>, IDeletable<string>, IRestorable<string>
{
    public static int Deletes;
    public static int Restores;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public void DeleteAllById(IReadOnlyList<string> selectedIds) => Interlocked.Increment(ref Deletes);

    public void RestoreAllById(IReadOnlyList<string> deletedIds) => Interlocked.Increment(ref Restores);
}

/// <summary>A crud whose edit gate is app logic (a static switch), not the caller's identity.</summary>
[UI("offline-toggle-parts"), Title("Parts")]
public class OfflineToggleParts : Crud<OfflineTogglePart>
{
    public static bool Editable = true;
    public static int Saves;
    private static readonly Dictionary<string, OfflineTogglePart> Store = new();

    public static void Reset()
    {
        Editable = true;
        Saves = 0;
        Store.Clear();
        Store["p1"] = new OfflineTogglePart { Id = "p1", Name = "Bolt" };
    }

    public override bool CanEdit => Editable;
    public override IEnumerable<OfflineTogglePart> Fetch(string? search) => Store.Values;
    public override OfflineTogglePart? Get(string id) => Store.GetValueOrDefault(id);

    public override void Save(OfflineTogglePart entity)
    {
        Interlocked.Increment(ref Saves);
        Store[entity.Id] = entity;
    }
}

