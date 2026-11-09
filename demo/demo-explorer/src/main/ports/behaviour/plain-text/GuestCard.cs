// The C# twin (Mateu.NET): [PlainText] per property ([Multiline] to wrap).
using Mateu.Uidl;

[UI("guest-card"), Title("Guest card")]
public class GuestCard
{
    [PlainText] public string Name { get; set; } = "Ada Lovelace";
    [PlainText] public DateOnly Arrival { get; set; } = new(2026, 12, 20);
    [PlainText] public int Nights { get; set; } = 4;
    [PlainText] public string PreferencesCut { get; set; } =
        "Quiet room away from the lift, extra pillows, sparkling water on arrival, late breakfast";
    [PlainText, Multiline] public string PreferencesWrapped { get; set; } =
        "Quiet room away from the lift, extra pillows, sparkling water on arrival, late breakfast";
}
