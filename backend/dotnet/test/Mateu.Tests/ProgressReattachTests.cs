using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
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

// The 3.0 completion of progress and notifications (design/progress-and-notifications.md,
// "Completed in 3.0"): reattach, ETA, OS notifications / inbox flags, the inbox store. Mirrors
// Java's ProgressReattachSyncTest / InboxStoreSyncTest and Python's test_progress_reattach.py.

[UI("reattach-jobs")]
public class ReattachJobs
{
    public static volatile bool CancelledHook;

    [Button]
    public LongTaskRun Endless() => LongTask.Create("Endless").Background().Cancellable()
        .OnCancel(() => CancelledHook = true)
        .Run((progress, ct) => Ticks(progress, ct));

    private static async IAsyncEnumerable<object> Ticks(ProgressReporter progress,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        for (var i = 0; ; i++)
        {
            await Task.Delay(20, ct);
            yield return progress.Step("tick " + i, i, 100_000);
        }
    }

    public static volatile bool Release;

    /// <summary>Runs until released, then ends done with an inbox message.</summary>
    [Button]
    public LongTaskRun Gated() => LongTask.Create("Gated").Background().NotifyWhenDone()
        .Done("Gated done", "all of it")
        .Run((progress, ct) => UntilReleased(progress, ct));

    private static async IAsyncEnumerable<object> UntilReleased(ProgressReporter progress,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        var i = 0;
        while (!Release)
        {
            await Task.Delay(20, ct);
            yield return progress.Step("waiting " + i++);
        }
    }

    [Button]
    public LongTaskRun Counted() => LongTask.Create("Counted").WithProgressBar()
        .Run(progress => Steps(progress));

    private static async IAsyncEnumerable<object> Steps(ProgressReporter progress)
    {
        for (var i = 1; i <= 5; i++)
        {
            await Task.Yield();
            yield return progress.Step("Row " + i, i, 5);
        }
    }

    [Button]
    public Message Saved() => new Message("Saved")
        .WithAction(MessageAction.Open("View", "/orders/1"))
        .WithAction(MessageAction.Run("Share", "share"))
        .WithPersistence(MessagePersistence.Inbox)
        .WithKey("order-1");

    [Button]
    public Message Unkeyed() => new Message("Exported").WithPersistence(MessagePersistence.Inbox);
}

[UI("inbox-only")]
[App("Inbox only", Inbox = true, OsNotifications = true)]
public class InboxOnlyApp
{
    [MenuItem("Home")] public FreezeHome Home() => new();
}

public class ProgressReattachTests
{
    private static SyncHandler Handler(string? principal = null, IInboxStore? store = null) =>
        new(new MateuRegistry(typeof(ProgressReattachTests).Assembly))
        {
            Principal = () => principal,
            InboxStore = store ?? new InMemoryInboxStore(),
        };

    private static RunActionRqDto Rq(string actionId, Dictionary<string, object?>? parameters = null) => new()
    {
        ServerSideType = typeof(ReattachJobs).FullName, Route = "/reattach-jobs", ActionId = actionId,
        Parameters = parameters ?? [],
    };

    private static List<ProgressDto> ProgressOf(IEnumerable<UIIncrementDto> increments) => increments
        .SelectMany(i => i.Commands).Where(c => c.Type == "Progress").Select(c => (ProgressDto)c.Data!).ToList();

    /// <summary>The SSE leg in process, HOT like the endpoint: the slot, then the multicast stream.</summary>
    private static (Task<List<UIIncrementDto>> All, List<UIIncrementDto> Seen) HotStream(SyncHandler handler,
        RunActionRqDto rq, CancellationToken token, TimeSpan grace)
    {
        var seen = new List<UIIncrementDto>();
        var all = Task.Run(async () =>
        {
            var slot = SyncHandler.BeginStream();
            var first = await handler.HandleAsync(rq, "", token);
            Assert.True(slot.HasStream);
            lock (seen) seen.Add(first);
            try
            {
                await foreach (var step in handler.ContinueStream(slot,
                                   e => UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", e.Message, 0)]),
                                   token, hot: true, grace: grace))
                    lock (seen) seen.Add(step);
            }
            catch (OperationCanceledException) { /* the stream was closed */ }
            lock (seen) return seen.ToList();
        });
        return (all, seen);
    }

    private static async Task<string> WaitForTask(List<UIIncrementDto> seen)
    {
        for (var i = 0; i < 250; i++)
        {
            List<ProgressDto> progress;
            lock (seen) progress = ProgressOf(seen);
            if (progress.Count > 1) return progress[0].TaskId;
            await Task.Delay(20);
        }
        throw new Xunit.Sdk.XunitException("the task never started");
    }

    private static async Task<List<UIIncrementDto>> Collect(IAsyncEnumerable<UIIncrementDto> stream, int max,
        CancellationToken token = default)
    {
        var all = new List<UIIncrementDto>();
        try
        {
            await foreach (var increment in stream.WithCancellation(token))
            {
                all.Add(increment);
                if (all.Count >= max) break;
            }
        }
        catch (OperationCanceledException) { /* closed */ }
        return all;
    }

    private static async Task Eventually(Func<bool> condition, string what)
    {
        for (var i = 0; i < 250; i++)
        {
            if (condition()) return;
            await Task.Delay(20);
        }
        throw new Xunit.Sdk.XunitException(what);
    }

    [Fact]
    public async Task A_task_survives_its_stream_and_its_caller_resumes_it()
    {
        ReattachJobs.CancelledHook = false;
        var handler = Handler("alice");
        using var close = new CancellationTokenSource();
        var (all, seen) = HotStream(handler, Rq("endless"), close.Token, TimeSpan.FromSeconds(30));
        var taskId = await WaitForTask(seen);
        close.Cancel();
        await all.WaitAsync(TimeSpan.FromSeconds(5));
        await Task.Delay(100);
        // the stream is gone, the task is not
        Assert.True(ProgressTasks.IsRunning(taskId));
        Assert.False(ReattachJobs.CancelledHook);

        var snapshot = handler.Handle(Rq(ProgressTasks.TasksAction,
            new() { ["taskIds"] = new List<object?> { taskId, "nope" } }));
        var listed = Assert.Single(ProgressOf([snapshot]));
        Assert.Equal((taskId, ProgressStates.Running), (listed.TaskId, listed.State));

        var resumed = await Collect(handler.ResumeTask(Rq(ProgressTasks.ResumeAction,
            new() { ["taskId"] = taskId }), CancellationToken.None), 3);
        var progress = ProgressOf(resumed);
        Assert.Equal(3, progress.Count);
        Assert.All(progress, p => Assert.Equal(taskId, p.TaskId));
        // reduced to what belongs to the page: no fragments
        Assert.All(resumed, i => Assert.Empty(i.Fragments));
        Assert.True(progress[^1].Done > progress[0].Done);

        // cancel it while nobody follows it: it ends cancelled, and its end is kept for the grace
        Assert.Equal(ProgressStates.Cancelled,
            Assert.Single(ProgressOf([handler.Handle(Rq(ProgressTasks.CancelAction, new() { ["taskId"] = taskId }))])).State);
        await Eventually(() => !ProgressTasks.IsRunning(taskId), "the task never stopped");
        await Eventually(() => ReattachJobs.CancelledHook, "OnCancel never ran");
        var ended = await Collect(handler.ResumeTask(Rq(ProgressTasks.ResumeAction,
            new() { ["taskId"] = taskId }), CancellationToken.None), 5);
        Assert.Equal(ProgressStates.Cancelled, Assert.Single(ProgressOf(ended)).State);
    }

    [Fact]
    public async Task A_resumed_stream_follows_the_task_to_its_end_with_its_messages()
    {
        ReattachJobs.Release = false;
        var handler = Handler("alice");
        using var close = new CancellationTokenSource();
        var (all, seen) = HotStream(handler, Rq("gated"), close.Token, TimeSpan.FromSeconds(30));
        var taskId = await WaitForTask(seen);
        close.Cancel();
        await all.WaitAsync(TimeSpan.FromSeconds(5));

        var resuming = Collect(handler.ResumeTask(Rq(ProgressTasks.ResumeAction,
            new() { ["taskId"] = taskId }), CancellationToken.None), 10_000);
        await Task.Delay(100);
        ReattachJobs.Release = true;
        var resumed = await resuming.WaitAsync(TimeSpan.FromSeconds(10));
        var last = ProgressOf(resumed)[^1];
        Assert.Equal((ProgressStates.Done, "Gated done"), (last.State, last.Title));
        Assert.Contains(resumed.SelectMany(i => i.Messages), m => m.Persistence == MessagePersistences.Inbox);
        // the work's commands meant for the screen that started it do not travel
        Assert.All(resumed.SelectMany(i => i.Commands), c => Assert.Contains(c.Type, new[] { "Progress", "NotificationsChanged" }));

        // a client reloading just after it ended still learns how it ended
        var late = handler.Handle(Rq(ProgressTasks.TasksAction, new() { ["taskIds"] = new List<object?> { taskId } }));
        Assert.Equal(ProgressStates.Done, Assert.Single(ProgressOf([late])).State);
    }

    [Fact]
    public async Task With_nobody_following_it_the_task_is_cancelled_after_the_grace_period()
    {
        ReattachJobs.CancelledHook = false;
        var handler = Handler("alice");
        using var close = new CancellationTokenSource();
        var (all, seen) = HotStream(handler, Rq("endless"), close.Token, TimeSpan.FromMilliseconds(150));
        var taskId = await WaitForTask(seen);
        close.Cancel();
        await all.WaitAsync(TimeSpan.FromSeconds(5));
        await Eventually(() => !ProgressTasks.IsRunning(taskId), "the grace period never ran out");
        await Eventually(() => ReattachJobs.CancelledHook, "OnCancel never ran");
    }

    [Fact]
    public async Task A_zero_grace_cancels_when_the_stream_closes()
    {
        ReattachJobs.CancelledHook = false;
        using var close = new CancellationTokenSource();
        var (all, seen) = HotStream(Handler("alice"), Rq("endless"), close.Token, TimeSpan.Zero);
        var taskId = await WaitForTask(seen);
        close.Cancel();
        await all.WaitAsync(TimeSpan.FromSeconds(5));
        await Eventually(() => !ProgressTasks.IsRunning(taskId), "closing the stream did not stop the task");
        await Eventually(() => ReattachJobs.CancelledHook, "OnCancel never ran");
    }

    [Fact]
    public async Task Another_caller_cannot_list_or_resume_it_and_cannot_tell_it_exists()
    {
        using var close = new CancellationTokenSource();
        var (all, seen) = HotStream(Handler("alice"), Rq("endless"), close.Token, TimeSpan.FromSeconds(30));
        try
        {
            var taskId = await WaitForTask(seen);
            foreach (var other in new[] { Handler("mallory"), Handler(null) })
            {
                var foreign = other.Handle(Rq(ProgressTasks.TasksAction, new() { ["taskIds"] = new List<object?> { taskId } }));
                var unknown = other.Handle(Rq(ProgressTasks.TasksAction, new() { ["taskIds"] = new List<object?> { "nope" } }));
                Assert.Empty(foreign.Commands);
                Assert.Equal(JsonSerializer.Serialize(unknown, MateuExtensions.Json),
                    JsonSerializer.Serialize(foreign, MateuExtensions.Json));
                Assert.Empty(await Collect(other.ResumeTask(Rq(ProgressTasks.ResumeAction,
                    new() { ["taskId"] = taskId }), CancellationToken.None), 5));
                Assert.Empty(other.Handle(Rq(ProgressTasks.ResumeAction, new() { ["taskId"] = taskId })).Commands);
            }
            Assert.True(ProgressTasks.IsRunning(taskId));
        }
        finally
        {
            close.Cancel();
            await all.WaitAsync(TimeSpan.FromSeconds(5));
            foreach (var taskId in ProgressOf(seen).Select(p => p.TaskId).Distinct())
                Handler("alice").Handle(Rq(ProgressTasks.CancelAction, new() { ["taskId"] = taskId }));
        }
    }

    [Fact]
    public void An_anonymous_callers_finished_task_is_not_listed_for_an_authenticated_one()
    {
        var increment = Handler(null).Handle(Rq("counted"));
        var taskId = ProgressOf([increment])[0].TaskId;
        Assert.Equal(ProgressStates.Done,
            Assert.Single(ProgressOf([Handler(null).Handle(Rq(ProgressTasks.TasksAction,
                new() { ["taskIds"] = new List<object?> { taskId } }))])).State);
        Assert.Empty(Handler("alice").Handle(Rq(ProgressTasks.TasksAction,
            new() { ["taskIds"] = new List<object?> { taskId } })).Commands);
    }

    [Fact]
    public void At_most_fifty_ids_are_looked_at()
    {
        var ids = Enumerable.Range(0, 60).Select(_ => (object?)ProgressOf([Handler("bob").Handle(Rq("counted"))])[0].TaskId).ToList();
        Assert.Equal(ProgressTasks.MaxSnapshotIds,
            Handler("bob").Handle(Rq(ProgressTasks.TasksAction, new() { ["taskIds"] = ids })).Commands.Count);
    }

    // ── ETA ──────────────────────────────────────────────────────────────────────────

    private static JsonObject EtaCorpus()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "conformance", "progress"))) dir = dir.Parent;
        Assert.NotNull(dir);
        return (JsonObject)JsonNode.Parse(File.ReadAllText(Path.Combine(dir!.FullName, "conformance", "progress", "eta.json")))!;
    }

    [Fact]
    public void The_eta_follows_the_conformance_corpus()
    {
        var cases = EtaCorpus()["cases"]!.AsArray();
        Assert.NotEmpty(cases);
        foreach (var c in cases)
        {
            var estimator = new EtaEstimator();
            var samples = c!["samples"]!.AsArray();
            var expected = c["expected"]!.AsArray();
            for (var i = 0; i < samples.Count; i++)
            {
                var s = samples[i]!.AsObject();
                var p = EtaEstimator.ValueOf(s["fraction"]?.GetValue<double>(), s["done"]?.GetValue<int>(),
                    s["total"]?.GetValue<int>());
                var actual = estimator.Observe(s["t"]!.GetValue<long>(), p,
                    s["state"]?.GetValue<string>() ?? ProgressStates.Running);
                Assert.True(expected[i]?.GetValue<int>() == actual,
                    $"{c["name"]}: sample {i} expected {expected[i]?.ToJsonString() ?? "null"}, got {actual?.ToString() ?? "null"}");
            }
        }
    }

    [Fact]
    public void A_running_determinate_task_carries_the_servers_eta()
    {
        var clock = 0L;
        var before = ProgressTasks.Now;
        ProgressTasks.Now = () => Interlocked.Add(ref clock, 1000);
        try
        {
            var progress = ProgressOf([Handler().Handle(Rq("counted"))]);
            Assert.Null(progress[0].EtaSeconds);
            Assert.Contains(progress, p => p.State == ProgressStates.Running && p.EtaSeconds is > 0);
            Assert.Null(progress[^1].EtaSeconds);
            Assert.Equal(ProgressStates.Done, progress[^1].State);
            // and the wire spells it like Java — absent when there is none
            var json = JsonSerializer.Serialize(Handler().Handle(Rq("counted")), MateuExtensions.Json);
            Assert.Contains("\"etaSeconds\":", json);
            ReattachJobs.Release = true;
            var indeterminate = JsonSerializer.Serialize(Handler().Handle(Rq("gated")), MateuExtensions.Json);
            Assert.DoesNotContain("\"etaSeconds\"", indeterminate);
        }
        finally
        {
            ProgressTasks.Now = before;
        }
    }

    // ── app flags ────────────────────────────────────────────────────────────────────

    [Fact]
    public void An_app_declares_os_notifications_and_a_bell_without_a_supplier()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto
            { ServerSideType = typeof(InboxOnlyApp).FullName, Route = "/inbox-only" }), MateuExtensions.Json);
        Assert.Contains("\"notificationsEnabled\":true", json);
        Assert.Contains("\"osNotifications\":true", json);
    }

    // ── the inbox store ──────────────────────────────────────────────────────────────

    [Fact]
    public void An_inbox_message_of_an_authenticated_caller_is_stored_and_pushed()
    {
        var store = new InMemoryInboxStore();
        var pushed = new List<LiveNotifications.Change>();
        UIIncrementDto answer;
        using (LiveNotifications.Subscribe(change => { lock (pushed) pushed.Add(change); }))
            answer = Handler("alice", store).Handle(Rq("saved"));
        Assert.Equal("order-1", Assert.Single(answer.Messages).Key);
        var entry = Assert.Single(store.List("alice"));
        Assert.Equal(("order-1", "Saved", true), (entry.Id, entry.Title, entry.Unread));
        Assert.Matches(@"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$", entry.When!);
        // only the actions that navigate travel: an actionId needs the screen that sent it
        Assert.Equal("/orders/1", Assert.Single(entry.Actions).Route);
        lock (pushed) Assert.Contains(pushed, c => c.Principal == "alice" && c.Notification?.Id == "order-1");

        // without a key the stored id becomes the message's key, so both are one entry
        var unkeyed = Assert.Single(Handler("alice", store).Handle(Rq("unkeyed")).Messages);
        Assert.StartsWith("inbox-", unkeyed.Key);
        Assert.Contains(store.List("alice"), n => n.Id == unkeyed.Key);
        // the same key replaces the entry
        Handler("alice", store).Handle(Rq("saved"));
        Assert.Equal(2, store.List("alice").Count);
    }

    [Fact]
    public void An_anonymous_callers_inbox_message_stays_session_only()
    {
        var store = new InMemoryInboxStore();
        var message = Assert.Single(Handler(null, store).Handle(Rq("unkeyed")).Messages);
        Assert.Null(message.Key);
        Assert.Empty(store.List("null"));
        Assert.Empty(store.List(""));
    }

    [Fact]
    public async Task A_task_that_notifies_when_done_stores_its_message_from_the_stream()
    {
        ReattachJobs.Release = true;
        var store = new InMemoryInboxStore();
        var (all, _) = HotStream(Handler("carol", store), Rq("gated"), CancellationToken.None, TimeSpan.FromSeconds(5));
        var increments = await all.WaitAsync(TimeSpan.FromSeconds(10));
        var message = increments.SelectMany(i => i.Messages).Single(m => m.Persistence == MessagePersistences.Inbox);
        Assert.Contains(store.List("carol"), n => n.Id == message.Key && n.Title == "Gated done");
    }

    private static RunActionRqDto DeskRq(string actionId, Dictionary<string, object?> parameters) => new()
    {
        ServerSideType = typeof(NotificationDesk).FullName, Route = "/notification-desk", ActionId = actionId,
        InitiatorComponentId = "_ux", Parameters = parameters,
    };

    private static List<AppNotificationDto> ListIn(UIIncrementDto increment) => increment.Fragments
        .Select(f => f.Data).OfType<Dictionary<string, object?>>()
        .Select(d => (List<AppNotificationDto>)d["_notifications"]!).First();

    [Fact]
    public void The_list_merges_the_suppliers_entries_and_the_stored_ones()
    {
        NotificationDesk.Seed();
        var store = new InMemoryInboxStore();
        store.Add("alice", new AppNotification("s1", "Stored", null, null));
        store.Add("alice", new AppNotification("e2", "Shadowed by the supplier", null, null));
        store.Add("bob", new AppNotification("b1", "Bob's", null, null));
        var listed = ListIn(Handler("alice", store).Handle(DeskRq("_notifications-list", [])));
        Assert.Equal(["e1", "e2", "s1"], listed.Select(n => n.Id));
        Assert.Equal("Backup done", listed[1].Title);

        // read / dismiss reach the store for its ids, the supplier for its own
        Handler("alice", store).Handle(DeskRq("_notifications-read", new() { ["ids"] = new List<object?> { "s1", "e1", "b1" } }));
        Assert.False(store.List("alice").Single(n => n.Id == "s1").Unread);
        Assert.Equal(["e1"], NotificationDesk.Read);
        Assert.True(store.List("bob").Single().Unread);
        Handler("alice", store).Handle(DeskRq("_notifications-dismiss", new() { ["ids"] = new List<object?> { "s1", "b1" } }));
        Assert.DoesNotContain(store.List("alice"), n => n.Id == "s1");
        Assert.Single(store.List("bob"));
        Assert.Empty(NotificationDesk.Dismissed);

        // a stored entry offers no action to run and no detail
        store.Add("alice", new AppNotification("s2", "Stored", null, null) { Actions = [MessageAction.Open("View", "/x")] });
        Assert.Throws<MateuForbiddenException>(() => Handler("alice", store).Handle(
            DeskRq("_notifications-act", new() { ["id"] = "s2", ["actionId"] = "approve" })));
        Assert.Empty(Handler("alice", store).Handle(DeskRq("_notifications-open", new() { ["id"] = "s2" })).Fragments);

        // an anonymous caller sees the supplier's list only
        Assert.Equal(["e1", "e2"], ListIn(Handler(null, store).Handle(DeskRq("_notifications-list", []))).Select(n => n.Id));
    }

    [Fact]
    public void An_inbox_only_app_lists_the_store()
    {
        var store = new InMemoryInboxStore();
        store.Add("alice", new AppNotification("s1", "Stored", null, null));
        var rq = new RunActionRqDto
        {
            ServerSideType = typeof(InboxOnlyApp).FullName, Route = "/inbox-only", ActionId = "_notifications-list",
            InitiatorComponentId = "_ux",
        };
        Assert.Equal(["s1"], ListIn(Handler("alice", store).Handle(rq)).Select(n => n.Id));
        Handler("alice", store).Handle(rq with { ActionId = "_notifications-read", Parameters = new() { ["ids"] = "all" } });
        Assert.False(store.List("alice").Single().Unread);
    }

    [Fact]
    public void The_in_memory_store_is_bounded_per_principal()
    {
        var store = new InMemoryInboxStore();
        for (var i = 0; i < InMemoryInboxStore.MaxEntriesPerPrincipal + 5; i++)
            store.Add("p", new AppNotification("n" + i, "N" + i, null, null));
        var list = store.List("p");
        Assert.Equal(InMemoryInboxStore.MaxEntriesPerPrincipal, list.Count);
        Assert.Equal("n" + (InMemoryInboxStore.MaxEntriesPerPrincipal + 4), list[0].Id);
        Assert.DoesNotContain(list, n => n.Id == "n0");
    }

    // ── over HTTP ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Over_http_a_reloaded_client_resumes_its_task()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(ProgressReattachTests).Assembly);
        await using var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) };
        HttpRequestMessage Post(string actionId, object parameters) => new(HttpMethod.Post, "/mateu/v3/sse/reattach-jobs")
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                serverSideType = typeof(ReattachJobs).FullName, route = "/reattach-jobs", actionId, parameters,
            }), System.Text.Encoding.UTF8, "application/json"),
        };
        string taskId;
        using (var started = await http.SendAsync(Post("endless", new { }), HttpCompletionOption.ResponseHeadersRead))
        {
            using var reader = new StreamReader(await started.Content.ReadAsStreamAsync());
            var first = await NextData(reader);
            taskId = JsonDocument.Parse(first["data:".Length..]).RootElement
                .GetProperty("commands")[0].GetProperty("data").GetProperty("taskId").GetString()!;
        } // the "tab" goes away
        await Task.Delay(200);
        Assert.True(ProgressTasks.IsRunning(taskId));

        using (var resumed = await http.SendAsync(Post(ProgressTasks.ResumeAction, new { taskId }),
                   HttpCompletionOption.ResponseHeadersRead))
        {
            using var reader = new StreamReader(await resumed.Content.ReadAsStreamAsync());
            var current = await NextData(reader);
            Assert.Contains(taskId, current);
            Assert.Contains("\"state\":\"running\"", current);
            Assert.Contains("\"state\":\"running\"", await NextData(reader));
        }
        var cancel = await http.PostAsync("/mateu/v3/sync/reattach-jobs", new StringContent(JsonSerializer.Serialize(new
        {
            serverSideType = typeof(ReattachJobs).FullName, route = "/reattach-jobs", actionId = ProgressTasks.CancelAction,
            parameters = new { taskId },
        }), System.Text.Encoding.UTF8, "application/json"));
        Assert.Contains("\"cancelled\"", await cancel.Content.ReadAsStringAsync());
        await Eventually(() => !ProgressTasks.IsRunning(taskId), "the task never stopped");
        await app.StopAsync();
    }

    private static async Task<string> NextData(StreamReader reader)
    {
        string? line;
        do line = await reader.ReadLineAsync(); while (line is not null && !line.StartsWith("data:"));
        return line ?? "";
    }
}
