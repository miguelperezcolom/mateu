// The C# twin (Mateu.NET): [Zone] on the class (repeatable), [Section(…, Zone = …)] per property.
using Mateu.Uidl;

[UI("reservation"), Title("Reservation")]
[Zone("left", "64%"), Zone("right", "36%")]
public class ReservationDesk
{
    [Section("Stay")] public string Locator { get; set; } = "ABC123";

    [Section("Guest", Zone = "left")] public string Guest { get; set; } = "Ada Lovelace";
    [Section("Guest", Zone = "left")] public string Email { get; set; } = "ada@example.com";

    [Section("Room", Zone = "right")] public string Room { get; set; } = "214";

    [Section("Payment", Zone = "right")] public string Card { get; set; } = "**** 4242";
}
