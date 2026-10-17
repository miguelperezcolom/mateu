using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("trigger-options"), Title("Trigger options")]
[Trigger(TriggerType.OnCustomEvent, "onPing", EventName = "ping")]
[Trigger(TriggerType.OnLoad, "poll")]
[SubscribeTo("order-saved", "reloadOrders", Source = SubscriptionSource.Component, From = "orders", Condition = "state.live")]
public class TriggerOptionsView
{
    public static readonly List<string> Calls = [];
    public string Name { get; set; } = "";

    public void OnPing() => Calls.Add("ping");
    public void Poll() => Calls.Add("poll");
    public void ReloadOrders() => Calls.Add("reload");
}

/// <summary>Triggers a .NET view declares — the mirror of Java's @Trigger / @SubscribeTo (M-A5).
/// The full wire of every kind is pinned by the triggers conformance case; these pin the options
/// around it: a subscription's source/from/condition, a raw OnCustomEvent listening on the
/// component itself, the event travelling as eventName (the member the renderers read), and the
/// actions a trigger names being runnable.</summary>
public class TriggerTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static UIIncrementDto Run(string actionId = "") =>
        new SyncHandler(new MateuRegistry(typeof(TriggerOptionsView).Assembly)).Handle(new RunActionRqDto
        {
            Route = "trigger-options", ConsumedRoute = "trigger-options",
            ServerSideType = typeof(TriggerOptionsView).FullName, ActionId = actionId,
            ComponentState = new Dictionary<string, object?>(), Parameters = new Dictionary<string, object?>(),
        });

    private static List<JsonElement> Triggers()
    {
        var root = JsonSerializer.SerializeToElement(Run(), Json);
        return root.GetProperty("fragments")[0].GetProperty("component").GetProperty("triggers").EnumerateArray().ToList();
    }

    private static JsonElement ByAction(string id) =>
        Triggers().First(t => t.GetProperty("actionId").GetString() == id);

    [Fact]
    public void A_subscription_carries_its_source_from_and_condition_and_its_event_as_event_name()
    {
        var sub = ByAction("reloadOrders");
        Assert.Equal("OnCustomEvent", sub.GetProperty("type").GetString());
        Assert.Equal("order-saved", sub.GetProperty("eventName").GetString());
        Assert.False(sub.TryGetProperty("event", out _)); // no renderer reads it: the port used to send only this
        Assert.Equal("COMPONENT", sub.GetProperty("source").GetString());
        Assert.Equal("orders", sub.GetProperty("from").GetString());
        Assert.Equal("state.live", sub.GetProperty("condition").GetString());
    }

    [Fact]
    public void A_raw_custom_event_trigger_listens_on_the_component_itself()
    {
        var raw = ByAction("onPing");
        Assert.Equal("ping", raw.GetProperty("eventName").GetString());
        Assert.Equal("SELF", raw.GetProperty("source").GetString());
    }

    [Fact]
    public void An_on_load_trigger_fires_once_by_default()
    {
        var load = ByAction("poll");
        Assert.Equal("OnLoad", load.GetProperty("type").GetString());
        Assert.Equal(1, load.GetProperty("times").GetInt32());
        Assert.Equal(0, load.GetProperty("timeoutMillis").GetInt32());
    }

    [Fact]
    public void The_actions_triggers_name_are_advertised_and_run()
    {
        var root = JsonSerializer.SerializeToElement(Run(), Json);
        var advertised = root.GetProperty("fragments")[0].GetProperty("component").GetProperty("actions")
            .EnumerateArray().Select(a => a.GetProperty("id").GetString()).ToHashSet();
        Assert.Subset(advertised, new HashSet<string?> { "onPing", "poll", "reloadOrders" });
        TriggerOptionsView.Calls.Clear();
        Run("poll");
        Assert.Equal(["poll"], TriggerOptionsView.Calls);
    }
}
