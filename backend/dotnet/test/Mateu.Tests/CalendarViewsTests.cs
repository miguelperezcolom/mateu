using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>A hotel's Property Calendar: all four views, a convention across the end of October
/// and a gala on 1 November, one labelled cell per date (the 30th is "danger") and clickable
/// dates.</summary>
[UI("property-calendar"), Title("Property calendar")]
public class PropertyCalendar : CalendarPage
{
    protected override DateOnly InitialMonth() => new(2026, 10, 28);

    protected override IReadOnlyList<CalendarView> Views() =>
        [CalendarView.Month, CalendarView.Week, CalendarView.Day, CalendarView.List];

    protected override IReadOnlyList<CalendarEvent> Events(DateOnly month) => month.Month == 10
        ?
        [
            new()
            {
                Id = "conv", Title = "Convention", Date = new DateOnly(2026, 10, 29),
                EndDate = new DateOnly(2026, 10, 31), StartTime = "09:00", EndTime = "18:00",
            },
        ]
        : [new() { Id = "gala", Title = "Gala", Date = new DateOnly(2026, 11, 1) }];

    protected override object? ActionOn(CalendarEvent ev) => $"/events/{ev.Id}";

    protected override IReadOnlyList<CalendarDay> Days(DateOnly from, DateOnly to)
    {
        var days = new List<CalendarDay>();
        for (var d = from; d <= to; d = d.AddDays(1))
            days.Add(new CalendarDay(d, $"Avail {d.Day}", d.Day == 30 ? "danger" : null));
        return days;
    }

    protected override bool DaysClickable => true;

    protected override object? ActionOnDay(DateOnly date) => $"/availability?date={date:yyyy-MM-dd}";
}

/// <summary>Calendar views (day, week, month, list), per-date cells and clickable dates — mirrors
/// Java's CalendarViewsSyncTest: the view switcher re-renders the period, the chevrons step by the
/// view, a week across two months asks both, and a date's cell runs its action with the date.</summary>
public class CalendarViewsTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static UIIncrementDto Run(string? actionId,
        Dictionary<string, object?>? state = null, Dictionary<string, object?>? parameters = null) =>
        new SyncHandler(new MateuRegistry(typeof(PropertyCalendar).Assembly)).Handle(new RunActionRqDto
        {
            Route = "/property-calendar", ActionId = actionId,
            ServerSideType = typeof(PropertyCalendar).FullName, InitiatorComponentId = "cal_app",
            ComponentState = state ?? [], Parameters = parameters ?? [],
        });

    private static JsonElement Val(string json) => JsonDocument.Parse(json).RootElement;

    private static JsonElement Root(UIIncrementDto inc) =>
        JsonDocument.Parse(JsonSerializer.Serialize(inc, Json)).RootElement;

    /// <summary>Every JSON object carrying "type": <paramref name="type"/>, anywhere in the tree.</summary>
    private static List<JsonElement> Collect(JsonElement el, string type)
    {
        var found = new List<JsonElement>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && t.GetString() == type)
                    found.Add(e);
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array)
                foreach (var i in e.EnumerateArray()) Walk(i);
        }
        Walk(el);
        return found;
    }

    private static JsonElement CalendarOf(UIIncrementDto inc)
    {
        var calendars = Collect(Root(inc), "Calendar");
        Assert.Single(calendars);
        return calendars[0];
    }

    [Fact]
    public void Month_view_carries_its_days_the_clickable_dates_and_the_view_switcher()
    {
        var inc = Run(null);
        var calendar = CalendarOf(inc);
        Assert.Equal("month", calendar.GetProperty("view").GetString());
        Assert.Equal("openCalendarDay", calendar.GetProperty("dayActionId").GetString());
        var days = calendar.GetProperty("days");
        Assert.Equal(31, days.GetArrayLength());
        Assert.Equal("danger", days[29].GetProperty("tone").GetString());
        var ev = calendar.GetProperty("events")[0];
        Assert.Equal("2026-10-31", ev.GetProperty("endDate").GetString());
        Assert.Equal("09:00", ev.GetProperty("startTime").GetString());
        var labels = Collect(Root(inc), "Button")
            .Select(b => b.TryGetProperty("label", out var l) ? l.GetString() : null).ToList();
        Assert.Contains("Month", labels);
        Assert.Contains("Week", labels);
        Assert.Contains("Day", labels);
        Assert.Contains("List", labels);
    }

    [Fact]
    public void The_week_view_spans_two_months_and_asks_both()
    {
        var calendar = CalendarOf(Run("switchCalendarView",
            state: new() { ["month"] = Val("\"2026-10-28\"") },
            parameters: new() { ["_view"] = Val("\"week\"") }));
        Assert.Equal("week", calendar.GetProperty("view").GetString());
        // Mon 26 Oct → Sun 1 Nov: the October convention and the November gala
        Assert.Equal(["conv", "gala"],
            calendar.GetProperty("events").EnumerateArray().Select(e => e.GetProperty("id").GetString()));
        var days = calendar.GetProperty("days");
        Assert.Equal("2026-10-26", days[0].GetProperty("date").GetString());
        Assert.Equal(7, days.GetArrayLength());
    }

    [Fact]
    public void The_chevrons_step_by_the_view()
    {
        var calendar = CalendarOf(Run("nextCalendarMonth",
            state: new() { ["month"] = Val("\"2026-10-28\""), ["view"] = Val("\"day\"") }));
        Assert.Equal("day", calendar.GetProperty("view").GetString());
        Assert.Equal("2026-10-29", calendar.GetProperty("month").GetString());
        Assert.Equal(1, calendar.GetProperty("days").GetArrayLength());
    }

    [Fact]
    public void Clicking_a_date_runs_the_day_action()
    {
        var inc = Run("openCalendarDay",
            state: new() { ["month"] = Val("\"2026-10-28\"") },
            parameters: new() { ["_date"] = Val("\"2026-10-30\"") });
        var navigations = inc.Commands.Where(c => c.Type == "NavigateTo").ToList();
        Assert.Single(navigations);
        Assert.Equal("/availability?date=2026-10-30", (string?)navigations[0].Data);
    }
}
