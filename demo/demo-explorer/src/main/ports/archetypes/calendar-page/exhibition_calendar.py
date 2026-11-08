# The Python twin (mateu-ui): the same archetype and hooks — four views, a label and tone per date,
# clickable dates and "+ Create". Events are dated relative to today.
from datetime import date, timedelta

from mateu_ui.uidl import CalendarPage, Message, MessageVariant, ui
from mateu_ui.uidl.components import CalendarDay, CalendarEvent, CalendarView


def event(id, title, day, end, start_time, end_time, color):
    return CalendarEvent(id=id, title=title, date=day, end_date=end,
                         start_time=start_time, end_time=end_time, color=color)


@ui("calendar-page")
class ExhibitionCalendar(CalendarPage):
    def views(self):
        return [CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list]

    def events(self, month, http_request):
        today = date.today()
        return [
            event("tour", "Curator's tour", today, None, "11:00", "12:00", "#6b8e23"),
            event("opening", "Opening night · Impressions of light", today + timedelta(days=2), None,
                  "19:00", "22:00", "#7b3f8c"),
            event("install", "Installation · gallery 6", today + timedelta(days=5),
                  today + timedelta(days=8), None, None, "#2c6e8f"),
            event("courier", "Loan courier arrives", today + timedelta(days=12), None,
                  "09:30", "10:30", "#c74634"),
        ]

    def days(self, date_from, date_to, http_request):
        """A label and tone per date: the museum is closed on Mondays."""
        span = (date_to - date_from).days + 1
        return [CalendarDay(date=d, label="Closed", tone="warning")
                for d in (date_from + timedelta(days=i) for i in range(span))
                if d.weekday() == 0]

    def days_clickable(self):
        return True

    def action_on_day(self, day, http_request):
        return Message(f"Group bookings on {day.isoformat()}", MessageVariant.INFO)

    def action_on(self, event, http_request):
        return Message(event.title, MessageVariant.INFO)

    def show_create(self):
        return True

    def create_action(self, http_request):
        return Message("A new-event form would open here.", MessageVariant.SUCCESS)
