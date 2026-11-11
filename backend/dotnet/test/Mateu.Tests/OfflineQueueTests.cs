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
}
