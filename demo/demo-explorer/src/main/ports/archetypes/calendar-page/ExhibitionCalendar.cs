// The C# twin (Mateu.NET): the same archetype and hooks — four views, a label and tone per date,
// clickable dates and "+ Create". Events are dated relative to today.
using Mateu.Uidl;

[UI("calendar-page")]
public class ExhibitionCalendar : CalendarPage
{
    protected override IReadOnlyList<CalendarView> Views() =>
        [CalendarView.Month, CalendarView.Week, CalendarView.Day, CalendarView.List];

    protected override IReadOnlyList<CalendarEvent> Events(DateOnly month)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        return
        [
            Event("tour", "Curator's tour", today, null, "11:00", "12:00", "#6b8e23"),
            Event("opening", "Opening night · Impressions of light", today.AddDays(2), null, "19:00", "22:00", "#7b3f8c"),
            Event("install", "Installation · gallery 6", today.AddDays(5), today.AddDays(8), null, null, "#2c6e8f"),
            Event("courier", "Loan courier arrives", today.AddDays(12), null, "09:30", "10:30", "#c74634"),
        ];
    }

    /// <summary>A label and tone per date: the museum is closed on Mondays.</summary>
    protected override IReadOnlyList<CalendarDay> Days(DateOnly from, DateOnly to)
    {
        var days = new List<CalendarDay>();
        for (var d = from; d <= to; d = d.AddDays(1))
            if (d.DayOfWeek == DayOfWeek.Monday) days.Add(new CalendarDay(d, "Closed", "warning"));
        return days;
    }

    protected override bool DaysClickable => true;
    protected override object? ActionOnDay(DateOnly date) => new Message($"Group bookings on {date:yyyy-MM-dd}", MessageVariant.Info);
    protected override object? ActionOn(CalendarEvent ev) => new Message(ev.Title ?? "", MessageVariant.Info);
    protected override bool ShowCreate => true;
    protected override object? CreateAction() => new Message("A new-event form would open here.", MessageVariant.Success);

    private static CalendarEvent Event(
        string id, string title, DateOnly date, DateOnly? end, string? from, string? to, string color) =>
        new() { Id = id, Title = title, Date = date, EndDate = end, StartTime = from, EndTime = to, Color = color };
}
