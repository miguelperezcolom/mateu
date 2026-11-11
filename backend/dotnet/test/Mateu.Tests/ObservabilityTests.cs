using System.Collections.Concurrent;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core.Observability;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

[UI("obs-orders"), Title("Orders")]
public class ObsOrders
{
    public string Note { get; set; } = "secret note";

    [Button] public Message Place() => new("placed");
    [Button] public Message OutOfStock() => throw new UserFacingException("Only 3 units left.");
    [Button] public Message Bug() => throw new InvalidOperationException("boom");
}

public class ObsItem
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("obs-items"), Title("Items")]
public class ObsItems : Crud<ObsItem>
{
    internal static readonly List<ObsItem> Items = [];
    public override IEnumerable<ObsItem> Fetch(string? search) => Items;
    public override void Delete(string id) => Items.RemoveAll(i => i.Id == id);
}

/// <summary>Records every audit event.</summary>
public sealed class RecordingAuditListener : IActionAuditListener
{
    internal static readonly ConcurrentQueue<ActionAuditEvent> Events = new();
    public void OnAction(ActionAuditEvent auditEvent) => Events.Enqueue(auditEvent);
}

/// <summary>Fails on every call: the request must not notice.</summary>
public sealed class BrokenAuditListener : IActionAuditListener
{
    public void OnAction(ActionAuditEvent auditEvent) => throw new InvalidOperationException("audit store down");
}

/// <summary>Observability of the request path (Java ObservabilitySyncTest, Python
/// test_observability.py): one activity + metrics per Mateu request on the "Mateu" ActivitySource /
/// Meter, and the IActionAuditListeners — who, what, on which records, how it ended; never a value.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class ObservabilityTests
{
    private static async Task<(WebApplication App, HttpClient Http)> Start()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(ObservabilityTests).Assembly);
        builder.Services.AddSingleton<IActionAuditListener, RecordingAuditListener>();
        builder.Services.AddSingleton<IActionAuditListener, BrokenAuditListener>();
        var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        return (app, new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) });
    }

    private static async Task<string> Post(HttpClient http, string route, string actionId, Type type,
        object? state = null, IDictionary<string, string>? headers = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync" + route)
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                serverSideType = type.FullName, route, actionId, componentState = state ?? new { },
                initiatorComponentId = "c1",
            }), System.Text.Encoding.UTF8, "application/json"),
        };
        foreach (var (k, v) in headers ?? new Dictionary<string, string>()) request.Headers.Add(k, v);
        return await (await http.SendAsync(request)).Content.ReadAsStringAsync();
    }

    private sealed class Recorder : IDisposable
    {
        public readonly ConcurrentQueue<Activity> Activities = new();
        public readonly ConcurrentQueue<(string Name, double Value, Dictionary<string, object?> Tags)> Measurements = new();
        private readonly ActivityListener _activities;
        private readonly MeterListener _meters = new();

        public Recorder()
        {
            _activities = new ActivityListener
            {
                ShouldListenTo = source => source.Name == MateuTelemetry.Name,
                Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllDataAndRecorded,
                ActivityStopped = Activities.Enqueue,
            };
            ActivitySource.AddActivityListener(_activities);
            _meters.InstrumentPublished = (instrument, listener) =>
            {
                if (instrument.Meter.Name == MateuTelemetry.Name) listener.EnableMeasurementEvents(instrument);
            };
            _meters.SetMeasurementEventCallback<double>((i, v, tags, _) => Record(i.Name, v, tags));
            _meters.SetMeasurementEventCallback<long>((i, v, tags, _) => Record(i.Name, v, tags));
            _meters.Start();
        }

        private void Record(string name, double value, ReadOnlySpan<KeyValuePair<string, object?>> tags)
        {
            var map = new Dictionary<string, object?>();
            foreach (var t in tags) map[t.Key] = t.Value;
            Measurements.Enqueue((name, value, map));
        }

        public Activity Request(string action) =>
            Activities.Single(a => a.DisplayName.StartsWith("mateu " + action + " "));

        public void Dispose()
        {
            _activities.Dispose();
            _meters.Dispose();
        }
    }

    [Fact]
    public async Task A_request_is_one_activity_with_its_route_action_view_outcome_and_correlation_id()
    {
        using var recorder = new Recorder();
        var (app, http) = await Start();
        await using var _ = app;
        await Post(http, "/obs-orders", "place", typeof(ObsOrders),
            headers: new Dictionary<string, string> { ["X-Mateu-Correlation-Id"] = "corr-123" });

        var activity = recorder.Request("place");
        Assert.Equal("mateu place /obs-orders", activity.DisplayName);
        Assert.Equal("/obs-orders", activity.GetTagItem("mateu.route"));
        Assert.Equal("/obs-orders", activity.GetTagItem("mateu.route.template"));
        Assert.Equal(typeof(ObsOrders).FullName, activity.GetTagItem("mateu.view"));
        Assert.Equal("ok", activity.GetTagItem("mateu.outcome"));
        Assert.Equal("corr-123", activity.GetTagItem("mateu.correlation_id"));
        Assert.Contains(recorder.Measurements, m => m.Name == "mateu.request.duration"
            && (string?)m.Tags["mateu.action"] == "place" && (string?)m.Tags["mateu.outcome"] == "ok");
    }

    [Fact]
    public async Task A_user_error_and_a_bug_are_told_apart_and_the_bug_is_counted()
    {
        using var recorder = new Recorder();
        var (app, http) = await Start();
        await using var _ = app;
        await Post(http, "/obs-orders", "outOfStock", typeof(ObsOrders));
        await Post(http, "/obs-orders", "bug", typeof(ObsOrders));

        Assert.Equal("user_error", recorder.Request("outOfStock").GetTagItem("mateu.outcome"));
        var bug = recorder.Request("bug");
        Assert.Equal("error", bug.GetTagItem("mateu.outcome"));
        Assert.Equal(typeof(InvalidOperationException).FullName, bug.GetTagItem("error.type"));
        Assert.Equal(ActivityStatusCode.Error, bug.Status);
        Assert.Contains(recorder.Measurements, m => m.Name == "mateu.request.errors" && (string?)m.Tags["mateu.action"] == "bug");
        var audited = RecordingAuditListener.Events.Last(e => e.ActionId == "bug");
        Assert.Equal(ActionOutcome.Error, audited.Outcome);
        Assert.Equal(bug.GetTagItem("mateu.error.reference"), audited.ErrorReference);
    }

    [Fact]
    public async Task A_refused_action_is_forbidden_and_measured_under_other_not_its_name()
    {
        using var recorder = new Recorder();
        var (app, http) = await Start();
        await using var _ = app;
        await Post(http, "/obs-orders", "noSuchActionXyz", typeof(ObsOrders));

        Assert.Equal("forbidden", recorder.Request("noSuchActionXyz").GetTagItem("mateu.outcome"));
        Assert.DoesNotContain(recorder.Measurements, m => (string?)m.Tags.GetValueOrDefault("mateu.action") == "noSuchActionXyz");
        Assert.Equal(ActionOutcome.Forbidden, RecordingAuditListener.Events.Last(e => e.ActionId == "noSuchActionXyz").Outcome);
    }

    [Fact]
    public async Task The_audit_event_says_who_what_and_on_which_records_but_never_the_state()
    {
        ObsItems.Items.Clear();
        ObsItems.Items.AddRange([new() { Id = "1", Name = "one" }, new() { Id = "2", Name = "two" }]);
        var (app, http) = await Start();
        await using var _ = app;
        await Post(http, "/obs-orders", "place", typeof(ObsOrders), new { note = "secret note" });
        var placed = RecordingAuditListener.Events.Last(e => e.ActionId == "place");
        Assert.Equal("/obs-orders", placed.Route);
        Assert.Equal(typeof(ObsOrders).FullName, placed.View);
        Assert.Equal(ActionOutcome.Ok, placed.Outcome);
        Assert.False(placed.ReservedAction);
        Assert.False(string.IsNullOrEmpty(placed.CorrelationId));
        Assert.DoesNotContain("secret note", placed.ToString());

        // the broken listener did not fail the request, and a crud delete names what it deleted
        var body = await Post(http, "/obs-items", "delete", typeof(ObsItems),
            new { crud_selected_items = new[] { new { id = "2", name = "two" } } });
        Assert.DoesNotContain("Something went wrong", body);
        Assert.Equal(["2"], RecordingAuditListener.Events.Last(e => e.ActionId == "delete").RecordIds);
    }

    [Fact]
    public void Route_templates_take_no_ids_and_the_series_are_bounded()
    {
        TelemetryNames.Reset();
        Assert.Equal("/products/:id/edit", TelemetryNames.RouteTemplate("/products/42/edit"));
        Assert.Equal("/orders/:id", TelemetryNames.RouteTemplate("/orders/3f2504e0-4f89-11d3-9a0c-0305e82c3301"));
        Assert.Equal("/bookings/:id", TelemetryNames.RouteTemplate("/bookings/BK2026A01?tab=2"));
        Assert.Equal("/products/new", TelemetryNames.RouteTemplate("/products/new"));
        Assert.Equal("/", TelemetryNames.RouteTemplate("_empty"));
        Assert.Equal(("_other", "_other"), TelemetryNames.MetricKey("/a", "x", ActionOutcome.NotFound));
        for (var i = 0; i < TelemetryNames.MaxSeries; i++) TelemetryNames.MetricKey("/r", "a" + i, ActionOutcome.Ok);
        Assert.Equal(("_other", "_other"), TelemetryNames.MetricKey("/r", "one-too-many", ActionOutcome.Ok));
        Assert.Equal(("/r", "a0"), TelemetryNames.MetricKey("/r", "a0", ActionOutcome.Ok));
        TelemetryNames.Reset();
    }

    [Fact]
    public void A_micro_frontend_resolution_is_a_child_activity_with_its_outcome()
    {
        using var recorder = new Recorder();
        RequestObservation.RecordChild("mateu microfrontend shop", TimeSpan.FromMilliseconds(120),
            [new("mateu.remote.id", "shop"), new("mateu.microfrontend.outcome", "timeout")], "TIMEOUT");
        var child = recorder.Activities.Single(a => a.DisplayName == "mateu microfrontend shop");
        Assert.Equal("shop", child.GetTagItem("mateu.remote.id"));
        Assert.Equal(ActivityStatusCode.Error, child.Status);
        Assert.True(child.Duration >= TimeSpan.FromMilliseconds(100));
    }
}
