using System.Runtime.CompilerServices;
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

// Progress and notifications as patterns (mirrors Java's ProgressReportingSyncTest,
// NotificationPatternsSyncTest and LongTaskProgressTest).

[UI("progress-jobs")]
public class ProgressJobs
{
    public static volatile bool CancelledHook;

    [Button]
    public LongTaskRun ImportAll() => LongTask.Create("Importing")
        .WithProgressBar()
        .Done("Imported", "3 rows")
        .CloseAfter(2)
        .WithCommand(UICommandDto.NavigateTo("/results"))
        .Run(progress => Rows(progress));

    private static async IAsyncEnumerable<object> Rows(ProgressReporter progress)
    {
        for (var i = 1; i <= 3; i++)
        {
            await Task.Yield();
            yield return i == 2 ? progress.Step("Row 2", 2, 3) : progress.Step("Row " + i);
        }
    }

    [Button]
    public LongTaskRun Background() => LongTask.Create("Syncing")
        .Background().Cancellable().Retryable()
        .ResultAction(MessageAction.Open("Open report", "/reports/1"))
        .NotifyWhenDone()
        .Run(progress => One(progress));

    private static async IAsyncEnumerable<object> One(ProgressReporter progress)
    {
        await Task.Yield();
        yield return progress.Step("Row 1");
    }

    [Button]
    public LongTaskRun Endless() => LongTask.Create("Endless")
        .OnCancel(() => CancelledHook = true)
        .Run((progress, ct) => Ticks(progress, ct));

    private static async IAsyncEnumerable<object> Ticks(ProgressReporter progress,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        for (var i = 0; ; i++)
        {
            await Task.Delay(20, ct);
            yield return progress.Step("tick " + i, i, 1000);
        }
    }

    [Button]
    public LongTaskRun Broken() => LongTask.Create("Broken").Retryable().Run(progress => Fails(progress));

    private static async IAsyncEnumerable<object> Fails(ProgressReporter progress)
    {
        await Task.Yield();
        yield return progress.Step("Row 1");
        throw new UserFacingException("Row 2 is invalid");
    }

    [Button]
    public Message Saved() => new Message("Saved")
        .WithAction(MessageAction.Open("View", "/orders/1"))
        .WithAction(MessageAction.Run("Share", "share", new Dictionary<string, object?> { ["id"] = 1 }).WithStyle("secondary"))
        .WithPersistence(MessagePersistence.Inbox)
        .WithKey("order-1");

    [Button]
    public Message Failed() => new("It failed", MessageVariant.Error);

    [Button]
    public Message Deleted() => Message.Undoable("Deleted", "restore", new Dictionary<string, object?> { ["id"] = 7 });
}

[UI("notification-desk")]
[App("Desk", LiveUpdates = true)]
public class NotificationDesk : INotificationsSupplier
{
    public static readonly List<AppNotification> Inbox = [];
    public static readonly List<string> Acted = [];

    [MenuItem("Home")] public FreezeHome Home() => new();

    public IReadOnlyList<AppNotification> Notifications()
    {
        lock (Inbox) return Inbox.ToList();
    }

    public void MarkNotificationsRead(IReadOnlyList<string> ids) { }

    public object? OnNotificationAction(string id, string actionId)
    {
        lock (Inbox)
        {
            Acted.Add(id + ":" + actionId);
            for (var i = 0; i < Inbox.Count; i++)
                if (Inbox[i].Id == id) Inbox[i] = Inbox[i] with { Resolved = true, Unread = false };
        }
        return new Message("Approved");
    }

    public void DismissNotifications(IReadOnlyList<string> ids)
    {
        lock (Inbox) Inbox.RemoveAll(n => ids.Contains(n.Id));
    }

    public object? NotificationDetail(string id) => new Drawer { HeaderTitle = "Expense " + id, Content = new Text("Detail") };

    public static void Seed()
    {
        lock (Inbox)
        {
            Inbox.Clear();
            Acted.Clear();
            Inbox.Add(new AppNotification("e1", "Expense to approve", null, null)
            {
                Category = "Approvals",
                Variant = MessageVariant.Warning,
                Actions = [MessageAction.Run("Approve", "approve").WithStyle("primary"),
                    MessageAction.Run("Reject", "reject").WithStyle("danger")],
                HasDetail = true,
            });
            Inbox.Add(new AppNotification("e2", "Backup done", null, null, false, "yesterday"));
        }
    }
}

public class ProgressAndNotificationsTests
{
    private static readonly JsonSerializerOptions Json = MateuExtensions.Json;

    private static SyncHandler Handler(string? principal = null) =>
        new(new MateuRegistry(typeof(ProgressAndNotificationsTests).Assembly)) { Principal = () => principal };

    private static RunActionRqDto Rq(string actionId, Dictionary<string, object?>? parameters = null) => new()
    {
        ServerSideType = typeof(ProgressJobs).FullName, Route = "/progress-jobs", ActionId = actionId,
        Parameters = parameters ?? [],
    };

    private static List<ProgressDto> ProgressOf(IEnumerable<UIIncrementDto> increments) => increments
        .SelectMany(i => i.Commands).Where(c => c.Type == "Progress").Select(c => (ProgressDto)c.Data!).ToList();

    [Fact]
    public void A_long_task_reports_the_whole_state_of_its_task()
    {
        var increment = Handler().Handle(Rq("importAll"));
        var progress = ProgressOf([increment]);
        Assert.Equal(5, progress.Count);
        Assert.Single(progress.Select(p => p.TaskId).Distinct());
        Assert.Empty(increment.Fragments);

        var start = progress[0];
        Assert.Equal(ProgressStates.Running, start.State);
        Assert.Equal("Importing", start.Title);
        Assert.Equal(LongTask.StartingText, start.Text);
        Assert.Equal(0.0, start.Fraction);
        Assert.True(start.Blocking);
        Assert.False(start.Cancellable);
        Assert.NotNull(start.StartedAt);

        Assert.Equal((2, 3), (progress[2].Done!.Value, progress[2].Total!.Value));
        Assert.Equal(2 / 3.0, progress[2].Fraction!.Value, 9);
        Assert.Equal("Importing", progress[3].Title);
        Assert.Equal(3, progress[3].Total);

        var done = progress[4];
        Assert.Equal(ProgressStates.Done, done.State);
        Assert.Equal(("Imported", "3 rows", 1.0, 2), (done.Title, done.Text, done.Fraction!.Value, done.CloseAfterSeconds!.Value));
        Assert.Contains(increment.Commands, c => c.Type == "NavigateTo" && c.TargetComponentId is null);
        Assert.False(ProgressTasks.IsRunning(done.TaskId));
    }

    [Fact]
    public void A_long_task_action_is_advertised_as_streamed()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto
            { ServerSideType = typeof(ProgressJobs).FullName, Route = "/progress-jobs" }), Json);
        Assert.Contains("\"id\":\"importAll\"", json);
        var root = JsonDocument.Parse(json).RootElement;
        var actions = root.GetProperty("fragments")[0].GetProperty("component").GetProperty("actions").EnumerateArray().ToList();
        Assert.True(actions.Single(a => a.GetProperty("id").GetString() == "importAll").GetProperty("sse").GetBoolean());
        Assert.False(actions.Single(a => a.GetProperty("id").GetString() == "saved").GetProperty("sse").GetBoolean());
    }

    [Fact]
    public void The_wire_spells_progress_like_java()
    {
        var json = JsonSerializer.SerializeToElement(Handler().Handle(Rq("importAll")), Json);
        var data = json.GetProperty("commands")[0].GetProperty("data");
        foreach (var key in new[] { "taskId", "title", "text", "fraction", "done", "total", "state", "blocking",
                     "backgroundable", "cancellable", "retryable", "startedAt", "closeAfterSeconds", "error", "resultActions" })
            Assert.True(data.TryGetProperty(key, out _), key);
        Assert.Equal("running", data.GetProperty("state").GetString());
    }

    [Fact]
    public void A_background_task_says_so_and_posts_its_result_to_the_inbox()
    {
        var increment = Handler().Handle(Rq("background"));
        var progress = ProgressOf([increment]);
        var start = progress[0];
        Assert.False(start.Blocking);
        Assert.False(start.Backgroundable);
        Assert.True(start.Cancellable);
        Assert.True(start.Retryable);
        Assert.Null(start.Fraction);
        var done = progress[^1];
        var action = Assert.Single(done.ResultActions);
        Assert.Equal(("Open report", "/reports/1"), (action.Label, action.Route));
        var message = Assert.Single(increment.Messages);
        Assert.Equal(MessagePersistences.Inbox, message.Persistence);
        Assert.Equal("task-" + done.TaskId, message.Key);
        Assert.Single(message.Actions);
    }

    [Fact]
    public void A_task_that_fails_ends_failed_with_the_message_the_user_sees()
    {
        var increment = Handler().Handle(Rq("broken"));
        var last = ProgressOf([increment])[^1];
        Assert.Equal(ProgressStates.Failed, last.State);
        Assert.Equal("Row 2 is invalid", last.Error);
        Assert.True(last.Retryable);
        Assert.Contains(increment.Messages, m => m.Text == "Row 2 is invalid");
        Assert.False(ProgressTasks.IsRunning(last.TaskId));
    }

    /// <summary>The SSE leg in process: the slot the endpoint opens, then the streamed rest.</summary>
    private static (Task<List<UIIncrementDto>> All, List<UIIncrementDto> Seen) Stream(SyncHandler handler,
        RunActionRqDto rq, CancellationToken token)
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
                                   e => UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", e.Message, 0)]), token))
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

    [Fact]
    public async Task The_caller_cancels_its_task_and_the_work_is_disposed()
    {
        ProgressJobs.CancelledHook = false;
        var handler = Handler("alice");
        var (all, seen) = Stream(handler, Rq("endless"), CancellationToken.None);
        var taskId = await WaitForTask(seen);
        Assert.True(ProgressTasks.IsRunning(taskId));

        var answer = handler.Handle(Rq(ProgressTasks.CancelAction, new() { ["taskId"] = taskId }));
        Assert.Equal(ProgressStates.Cancelled, Assert.Single(ProgressOf([answer])).State);

        var increments = await all.WaitAsync(TimeSpan.FromSeconds(5));
        var last = ProgressOf(increments)[^1];
        Assert.Equal(ProgressStates.Cancelled, last.State);
        Assert.False(last.Cancellable);
        Assert.True(ProgressJobs.CancelledHook);
        Assert.False(ProgressTasks.IsRunning(taskId));
    }

    [Fact]
    public async Task Another_caller_cannot_cancel_it()
    {
        using var close = new CancellationTokenSource();
        var (all, seen) = Stream(Handler("alice"), Rq("endless"), close.Token);
        try
        {
            var taskId = await WaitForTask(seen);
            var answer = Handler("mallory").Handle(Rq(ProgressTasks.CancelAction, new() { ["taskId"] = taskId }));
            Assert.Empty(answer.Commands);
            Assert.True(ProgressTasks.IsRunning(taskId));
            Assert.Empty(Handler("alice").Handle(Rq(ProgressTasks.CancelAction, new() { ["taskId"] = "nope" })).Commands);
        }
        finally
        {
            close.Cancel();
            await all.WaitAsync(TimeSpan.FromSeconds(5));
        }
    }

    [Fact]
    public async Task Closing_the_stream_cancels_the_work()
    {
        ProgressJobs.CancelledHook = false;
        using var close = new CancellationTokenSource();
        var (all, seen) = Stream(Handler("alice"), Rq("endless"), close.Token);
        var taskId = await WaitForTask(seen);
        close.Cancel();
        await all.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.True(ProgressJobs.CancelledHook);
        Assert.False(ProgressTasks.IsRunning(taskId));
    }

    [Fact]
    public void A_message_says_its_persistence_actions_and_key()
    {
        var message = Assert.Single(Handler().Handle(Rq("saved")).Messages);
        Assert.Equal(MessagePersistences.Inbox, message.Persistence);
        Assert.Equal("order-1", message.Key);
        Assert.Equal(2, message.Actions.Count);
        Assert.Equal("/orders/1", message.Actions[0].Route);
        Assert.Equal(("share", "secondary"), (message.Actions[1].ActionId, message.Actions[1].Style));
        Assert.Equal(1, message.Actions[1].Parameters!["id"]);
    }

    [Fact]
    public void An_error_is_sticky_and_anything_else_a_toast()
    {
        var error = Assert.Single(Handler().Handle(Rq("failed")).Messages);
        Assert.Equal((MessagePersistences.Sticky, 0), (error.Persistence, error.Duration));
        var undo = Assert.Single(Handler().Handle(Rq("deleted")).Messages);
        Assert.Equal(MessagePersistences.Toast, undo.Persistence);
        Assert.Equal("restore", undo.UndoActionId);
        var action = Assert.Single(undo.Actions);
        Assert.Equal(("restore", "undo"), (action.ActionId, action.Style));
        Assert.Equal(7, action.Parameters!["id"]);
        // a MessageDto built with only the legacy undo members still lists it
        var legacy = new MessageDto("contrast", "middle", "", "x", 3000, null, "restore", null);
        Assert.Equal("undo", Assert.Single(legacy.Actions).Style);
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
    public void Inbox_entries_are_acted_upon_dismissed_and_opened()
    {
        NotificationDesk.Seed();
        var acted = Handler().Handle(DeskRq("_notifications-act", new() { ["id"] = "e1", ["actionId"] = "approve" }));
        Assert.Equal(["e1:approve"], NotificationDesk.Acted);
        Assert.Contains(acted.Messages, m => m.Text == "Approved");
        var first = ListIn(acted)[0];
        Assert.True(first.Resolved);
        Assert.Equal(("Approvals", "warning", true), (first.Category, first.Variant, first.HasDetail));
        Assert.Equal(2, first.Actions.Count);

        var dismissed = Handler().Handle(DeskRq("_notifications-dismiss", new() { ["ids"] = new List<object?> { "e2" } }));
        Assert.Equal(["e1"], ListIn(dismissed).Select(n => n.Id));

        var opened = Handler().Handle(DeskRq("_notifications-open", new() { ["id"] = "e1" }));
        Assert.Contains("Expense e1", JsonSerializer.Serialize(opened, Json));
    }

    [Fact]
    public void Live_changes_reach_only_the_sessions_of_their_user()
    {
        NotificationDesk.Seed();
        var forAlice = new LiveNotifications.Change("alice", NotificationDesk.Inbox[0], null);
        var forAll = new LiveNotifications.Change(null, new AppNotification("all", "Maintenance", null, null), null);
        Assert.True(SyncHandler.IsFor(forAlice, "alice"));
        Assert.False(SyncHandler.IsFor(forAlice, "bob"));
        Assert.False(SyncHandler.IsFor(forAlice, null));
        Assert.True(SyncHandler.IsFor(forAll, null));
        var command = SyncHandler.NotificationsChangedCommand(forAlice);
        Assert.Equal("NotificationsChanged", command.Type);
        var data = (NotificationsChangedDto)command.Data!;
        Assert.Equal(("e1", 2), (data.Notification!.Id, data.Notification.Actions.Count));
        var seen = new List<LiveNotifications.Change>();
        using (LiveNotifications.Subscribe(seen.Add))
        {
            LiveNotifications.Publish("alice", NotificationDesk.Inbox[0]);
            LiveNotifications.Remove("alice", "e1");
            LiveNotifications.Refresh(null);
        }
        Assert.Equal(3, seen.Count);
        Assert.Throws<ArgumentException>(() => LiveNotifications.Publish(" ", NotificationDesk.Inbox[0]));
    }

    [Fact]
    public async Task Over_http_a_long_task_streams_its_steps()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(ProgressAndNotificationsTests).Assembly);
        await using var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) };
        var request = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sse/progress-jobs")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new { serverSideType = typeof(ProgressJobs).FullName, route = "/progress-jobs", actionId = "importAll" }),
                System.Text.Encoding.UTF8, "application/json"),
        };
        var body = await (await http.SendAsync(request)).Content.ReadAsStringAsync();
        var events = body.Split("\n\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.True(events.Length >= 5, body);
        Assert.Contains("\"state\":\"running\"", events[0]);
        Assert.Contains("\"state\":\"done\"", events[^1]);

        // the live-updates stream carries inbox changes for everyone — and not those of another
        // user (this caller is anonymous)
        var live = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sse/notification-desk")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new { serverSideType = typeof(NotificationDesk).FullName, route = "/notification-desk", actionId = "_live-updates" }),
                System.Text.Encoding.UTF8, "application/json"),
        };
        using var response = await http.SendAsync(live, HttpCompletionOption.ResponseHeadersRead);
        using var reader = new StreamReader(await response.Content.ReadAsStreamAsync());
        await NextData(reader); // the header-value catch-up
        LiveNotifications.Publish("alice", new AppNotification("private", "For alice", null, null));
        LiveNotifications.PublishToAll(new AppNotification("all", "Maintenance at 22:00", null, null));
        var change = await NextData(reader);
        Assert.Contains("\"NotificationsChanged\"", change);
        Assert.Contains("\"all\"", change);
        Assert.DoesNotContain("private", change);
        await app.StopAsync();
    }

    private static async Task<string> NextData(StreamReader reader)
    {
        string? line;
        do line = await reader.ReadLineAsync(); while (line is not null && !line.StartsWith("data:"));
        return line ?? "";
    }
}
