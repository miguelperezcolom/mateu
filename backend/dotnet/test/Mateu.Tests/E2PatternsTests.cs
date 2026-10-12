using System.Text.Json;
using System.Text.Json.Serialization;
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

// The E2 patterns, mirroring Java's RecordMergeSyncTest + AppShellExtrasSyncTest fixtures:
// compare & merge, app-wide shortcuts, live header values (+ the SSE event stream) and the
// idle-session warning.

[UI("record-merge")]
public class RecordMergeView : IComponentTreeSupplier
{
    public static string? LastMerged;

    public IComponent Component() => new RecordMerge
    {
        Title = "Duplicate guests",
        Records = [new MergeRecord("a", "Profile 1021", "12 stays"), new MergeRecord("b", "Profile 3388")],
        Fields =
        [
            MergeField.Of("name", "Name", "Ana García", "Ana García"),
            MergeField.Of("email", "Email", null, "ana@example.com"),
            MergeField.Of("phone", null, "+34 600 000 000", "+34 611 111 111") with { Editable = true, Chosen = "b" },
            // a short row: padded with a blank value for the second record
            new MergeField("vip", "VIP", [true]),
        ],
        MergeActionId = "mergeProfiles",
        Parameters = new Dictionary<string, object?> { ["survivor"] = "a" },
    };

    public string MergeProfiles(Dictionary<string, object?> parameters)
    {
        LastMerged = parameters.TryGetValue("_merged", out var merged) ? merged?.ToString() : null;
        return "merged";
    }
}

[UI("e2-plain")]
[App("Plain")]
public class E2PlainApp
{
    [MenuItem("Home")] public FreezeHome Home() => new();
}

[UI("e2")]
[App("Front desk", LiveUpdates = true, IdleTimeoutMinutes = 20, IdleWarningSeconds = 45)]
[AppShortcut(Key = "F9", Route = "/reservations", Label = "Reservations", Code = "RES")]
[AppShortcut(Key = "alt+g", Route = "/guests")]
[AppShortcut(Code = "SYNC", ActionId = "syncNow", Label = "Sync now")]
[AppShortcut(Label = "nothing to press")]
public class E2FrontDeskApp : IHeaderValuesSupplier, IKeepAliveHandler
{
    public static int KeepAlives;

    [MenuItem("Home")] public FreezeHome Home() => new();

    public IReadOnlyList<HeaderValue> HeaderValues() =>
    [
        new HeaderValue("businessDate", "Business date", "12 Oct 2026"),
        new HeaderValue("shift", null, "Night"),
    ];

    public void KeepAlive() => Interlocked.Increment(ref KeepAlives);

    public Message SyncNow() => new("synced");

    [Action]
    public UICommandDto CloseDay() => UICommandDto.UpdateHeaderValue("businessDate", "13 Oct 2026");
}

public class E2PatternsTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(E2PatternsTests).Assembly));

    private static AppMetadataDto App(Type type) => (AppMetadataDto)new ReflectionMapper().MapApp(type).Metadata;

    [Fact]
    public void A_record_merge_travels_with_differences_and_default_picks()
    {
        var root = JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = typeof(RecordMergeView).FullName }), Json);
        var merge = Assert.Single(Objects(root), o => o.TryGetProperty("type", out var t)
            && t.ValueKind == JsonValueKind.String && t.GetString() == "RecordMerge");
        Assert.Equal("Duplicate guests", merge.GetProperty("title").GetString());
        Assert.Equal("Merge", merge.GetProperty("mergeLabel").GetString());
        Assert.Equal("mergeProfiles", merge.GetProperty("mergeActionId").GetString());
        Assert.False(merge.GetProperty("differencesOnly").GetBoolean());
        Assert.Equal("a", merge.GetProperty("parameters").GetProperty("survivor").GetString());
        var records = merge.GetProperty("records").EnumerateArray().ToList();
        Assert.Equal(["a", "b"], records.Select(r => r.GetProperty("id").GetString()));
        Assert.Equal("12 stays", records[0].GetProperty("caption").GetString());

        var fields = merge.GetProperty("fields").EnumerateArray()
            .ToDictionary(f => f.GetProperty("fieldId").GetString()!);
        Assert.False(fields["name"].GetProperty("differs").GetBoolean());
        Assert.Equal("a", fields["name"].GetProperty("chosen").GetString());
        // the first record has no email: the first NON-BLANK value is picked
        Assert.True(fields["email"].GetProperty("differs").GetBoolean());
        Assert.Equal("b", fields["email"].GetProperty("chosen").GetString());
        // a declared pick wins; a missing label is the field id humanized
        Assert.Equal("b", fields["phone"].GetProperty("chosen").GetString());
        Assert.True(fields["phone"].GetProperty("editable").GetBoolean());
        Assert.Equal("Phone", fields["phone"].GetProperty("label").GetString());
        Assert.Equal(2, fields["vip"].GetProperty("values").GetArrayLength());
        Assert.True(fields["vip"].GetProperty("differs").GetBoolean());
    }

    [Fact]
    public void The_merge_action_is_advertised()
    {
        var root = JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = typeof(RecordMergeView).FullName }), Json);
        Assert.Contains(Objects(root), o => o.TryGetProperty("id", out var id)
            && id.ValueKind == JsonValueKind.String && id.GetString() == "mergeProfiles");
    }

    [Fact]
    public void Everything_is_off_by_default()
    {
        var app = App(typeof(E2PlainApp));
        Assert.Empty(app.Shortcuts);
        Assert.Empty(app.HeaderValues);
        Assert.False(app.LiveUpdates);
        Assert.Null(app.IdleSession);
    }

    [Fact]
    public void App_shortcuts_travel_with_absolute_routes_and_labels()
    {
        var shortcuts = App(typeof(E2FrontDeskApp)).Shortcuts;
        Assert.Equal(3, shortcuts.Count);
        Assert.Equal(new AppShortcutDto("f9", "Reservations", "/e2/reservations", null, "RES"), shortcuts[0]);
        Assert.Equal("Guests", shortcuts[1].Label);
        Assert.Equal("/e2/guests", shortcuts[1].Route);
        Assert.Equal("syncNow", shortcuts[2].ActionId);
        Assert.Null(shortcuts[2].Route);
    }

    [Fact]
    public void An_action_shortcut_runs_on_the_app()
    {
        var increment = Handler().Handle(new RunActionRqDto
        {
            ServerSideType = typeof(E2FrontDeskApp).FullName, Route = "/e2", ActionId = "syncNow",
        });
        Assert.Contains(increment.Messages, m => m.Text == "synced");
    }

    [Fact]
    public void Header_values_come_from_the_supplier_and_change_with_a_command()
    {
        LiveHeaderValues.Reset();
        Assert.Equal(
            [new HeaderValueDto("businessDate", "Business date", "12 Oct 2026"), new HeaderValueDto("shift", null, "Night")],
            App(typeof(E2FrontDeskApp)).HeaderValues);

        var increment = Handler().Handle(new RunActionRqDto
        {
            ServerSideType = typeof(E2FrontDeskApp).FullName, Route = "/e2", ActionId = "closeDay",
        });
        var command = Assert.Single(increment.Commands, c => c.Type == "UpdateHeaderValue");
        var json = JsonSerializer.SerializeToElement(command, Json);
        Assert.Equal("businessDate", json.GetProperty("data").GetProperty("id").GetString());
        Assert.Equal(JsonValueKind.Null, json.GetProperty("data").GetProperty("label").ValueKind);
        Assert.Equal("13 Oct 2026", json.GetProperty("data").GetProperty("value").GetString());
    }

    [Fact]
    public void A_publish_reaches_subscribers_and_newer_shells()
    {
        LiveHeaderValues.Reset();
        var seen = new List<HeaderValue>();
        using (LiveHeaderValues.Subscribe(seen.Add))
            LiveHeaderValues.Publish("businessDate", "13 Oct 2026");
        LiveHeaderValues.Publish("shift", "Morning"); // after unsubscribing: not seen
        Assert.Equal([new HeaderValue("businessDate", null, "13 Oct 2026")], seen);
        // a shell built AFTER the publish starts from the published value, label kept
        Assert.Contains(new HeaderValueDto("businessDate", "Business date", "13 Oct 2026"),
            App(typeof(E2FrontDeskApp)).HeaderValues);
        // the stream's catch-up carries the snapshot
        Assert.Equal(2, SyncHandler.LiveUpdatesSnapshot().Commands.Count);
        LiveHeaderValues.Reset();
    }

    [Fact]
    public void The_idle_warning_is_configured_in_seconds_with_the_keep_alive_action()
    {
        var app = App(typeof(E2FrontDeskApp));
        Assert.Equal(new IdleSessionDto(20 * 60, 45, "/e2", "_keep-alive"), app.IdleSession);
        Assert.True(app.LiveUpdates);
    }

    [Fact]
    public void Keep_alive_reaches_the_apps_handler()
    {
        var before = E2FrontDeskApp.KeepAlives;
        var increment = Handler().Handle(new RunActionRqDto
        {
            ServerSideType = typeof(E2FrontDeskApp).FullName, Route = "/e2", ActionId = "_keep-alive",
        });
        Assert.Empty(increment.Messages);
        Assert.Equal(before + 1, E2FrontDeskApp.KeepAlives);
    }

    [Fact]
    public async Task The_live_updates_stream_catches_up_and_carries_every_publish()
    {
        LiveHeaderValues.Reset();
        LiveHeaderValues.Publish("shift", "Morning");
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(E2PatternsTests).Assembly);
        await using var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) };
        var request = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sse/e2")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new { serverSideType = typeof(E2FrontDeskApp).FullName, route = "/e2", actionId = "_live-updates" }),
                System.Text.Encoding.UTF8, "application/json"),
        };
        using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType?.MediaType);
        using var reader = new StreamReader(await response.Content.ReadAsStreamAsync());
        var first = await NextData(reader);
        Assert.Contains("\"UpdateHeaderValue\"", first);
        Assert.Contains("\"Morning\"", first);
        LiveHeaderValues.Publish("businessDate", "14 Oct 2026");
        var second = await NextData(reader);
        Assert.Contains("\"businessDate\"", second);
        Assert.Contains("\"14 Oct 2026\"", second);
        LiveHeaderValues.Reset();

        // any other action streams its single increment
        var plain = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sse/e2")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new { serverSideType = typeof(E2FrontDeskApp).FullName, route = "/e2", actionId = "syncNow" }),
                System.Text.Encoding.UTF8, "application/json"),
        };
        var body = await (await http.SendAsync(plain)).Content.ReadAsStringAsync();
        Assert.StartsWith("data: ", body);
        Assert.Contains("synced", body);
    }

    private static async Task<string> NextData(StreamReader reader)
    {
        string? line;
        do line = await reader.ReadLineAsync(); while (line is not null && !line.StartsWith("data:"));
        return line ?? "";
    }

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }
}
