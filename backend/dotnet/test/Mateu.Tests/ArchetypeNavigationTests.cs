using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// What the calendar and to-do archetypes do on the user's clicks, driven on the instance: the
/// chevrons step by the CURRENT view's period, Today jumps back, an event spanning two months is
/// listed once, a stale click does nothing; to-do buckets honour the declared order and an
/// unknown item is a no-op. Plus the export column's text for every value kind.
/// </summary>
public class ArchetypeNavigationTests
{
    public class Agenda : CalendarPage
    {
        public readonly List<DateOnly> Fetched = [];
        public DateOnly? ClickedDay;

        protected override IReadOnlyList<CalendarEvent> Events(DateOnly month)
        {
            Fetched.Add(month);
            // the same untitled-id event comes back for both months a week can touch
            return
            [
                new CalendarEvent { Title = "Standup", Date = new DateOnly(2026, 9, 30) },
                new CalendarEvent { Id = $"m{month.Month}", Title = "Month review", Date = month },
            ];
        }

        protected override object? ActionOn(CalendarEvent ev) => "/events/" + ev.Id;
        protected override DateOnly InitialMonth() => new(2026, 10, 1);
        protected override IReadOnlyList<CalendarView> Views() => [CalendarView.Week, CalendarView.Day, CalendarView.Month];
        protected override object? ActionOnDay(DateOnly date) { ClickedDay = date; return "day"; }
    }

    [Fact]
    public void The_chevrons_step_by_the_current_view()
    {
        var page = new Agenda { Month = "2026-10-15" };
        page.NextMonth(); // the first allowed view (week) is the initial one
        Assert.Equal("2026-10-22", page.Month);
        page.SwitchView("day");
        page.PreviousMonth();
        Assert.Equal("2026-10-21", page.Month);
        page.SwitchView("month");
        page.NextMonth();
        Assert.Equal("2026-11-21", page.Month);
        page.SwitchView(null); // a click without a view keeps the current one
        Assert.Equal("month", page.View);
        page.SwitchView("decade"); // a view the page does not offer falls back to the first one
        page.NextMonth();
        Assert.Equal("2026-11-28", page.Month);
    }

    [Fact]
    public void Today_jumps_back_to_the_current_date()
    {
        var page = new Agenda { Month = "2001-01-01" };
        page.GoToday();
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today).ToString("yyyy-MM-dd"), page.Month);
    }

    [Fact]
    public void A_week_across_two_months_fetches_both_and_lists_a_repeated_event_once()
    {
        var page = new Agenda { Month = "2026-10-01" }; // week of Mon 28 Sep → Sun 4 Oct
        Assert.Equal("/events/m10", page.OpenCalendarEvent("m10"));
        Assert.Equal([new DateOnly(2026, 9, 1), new DateOnly(2026, 10, 1)], page.Fetched);
        Assert.Equal("m10", page.EventId);
        Assert.Null(page.OpenCalendarEvent("gone"));
    }

    [Fact]
    public void A_day_click_parses_the_date_and_a_garbled_one_does_nothing()
    {
        var page = new Agenda();
        Assert.Equal("day", page.OpenCalendarDay("2026-10-17"));
        Assert.Equal(new DateOnly(2026, 10, 17), page.ClickedDay);
        Assert.Null(page.OpenCalendarDay("not-a-date"));
        Assert.Null(page.OpenCalendarDay(null));
        Assert.Null(page.CreateCalendarEvent()); // no create flow declared
    }

    public record Task(string Id, string Title, string When);

    public class Todo : TodoList<Task>
    {
        protected override IEnumerable<Task> Rows() =>
        [
            new("1", "Call", "Later"),
            new("2", "Pay", "Today"),
            new("3", "Plan", "Someday"),
            new("4", "Mail", "Today"),
        ];

        protected override string? IdOf(Task row) => row.Id;
        protected override string TitleOf(Task row) => row.Title;
        protected override string GroupOf(Task row) => row.When;
        protected override object? ActionOn(Task row) => "/tasks/" + row.Id;
        protected override IReadOnlyList<string> GroupOrder() => ["Today", "Later"];
    }

    [Fact]
    public void To_do_buckets_follow_the_declared_order_and_unlisted_ones_go_last()
    {
        var queue = (TaskQueue)new Todo { SelectedId = "4" }.Component();
        Assert.Equal(["Today (2)", "Later (1)", "Someday (1)"], queue.Groups.Select(g => g.Label!).ToArray());
        Assert.True(queue.Groups[0].Items.Single(i => i.Id == "4").Selected);
        Assert.Null(queue.Groups[0].Items.Single(i => i.Id == "2").Caption);
        Assert.Empty(queue.Groups[0].Items[0].Badges);
    }

    [Fact]
    public void Clicking_an_item_acts_on_it_and_an_unknown_one_does_nothing()
    {
        var todo = new Todo();
        Assert.Equal("/tasks/3", todo.OpenTodoItem("3"));
        Assert.Equal("3", todo.SelectedId);
        Assert.Null(todo.OpenTodoItem("99"));
    }

    public record Line(string? Name, DateOnly Day, DateTime At, bool Paid, decimal Amount, Uri Link);

    [Fact]
    public void An_export_cell_is_culture_invariant_text()
    {
        var row = new Line(null, new DateOnly(2026, 10, 17), new DateTime(2026, 10, 17, 9, 5, 0), true, 1234.5m, new Uri("https://x.example/"));
        Assert.Equal("", new ExportColumn("Name", "Name").TextOf(row));
        Assert.Equal("2026-10-17", new ExportColumn("Day", "Day").TextOf(row));
        Assert.Equal("2026-10-17T09:05:00", new ExportColumn("At", "At").TextOf(row));
        Assert.Equal("true", new ExportColumn("Paid", "Paid").TextOf(row));
        Assert.Equal("1234.5", new ExportColumn("Amount", "Amount").TextOf(row));
        Assert.Equal("https://x.example/", new ExportColumn("Link", "Link").TextOf(row));
        Assert.Equal("", new ExportColumn("Missing", "Missing").TextOf(row));
        Assert.Equal("", new ExportColumn("Name", "Name").TextOf(null));
        Assert.Equal("export.pdf", ExportFormat.Pdf.DefaultFilename());
    }
}
