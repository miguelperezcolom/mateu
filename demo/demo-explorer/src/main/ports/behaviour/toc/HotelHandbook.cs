// The C# twin (Mateu.NET): [Toc] on the class (the port has no sticky sections).
using Mateu.Uidl;

[UI("handbook"), Title("Hotel handbook"), Toc]
public class HotelHandbook
{
    [Section("Arrival")] public string CheckInFrom { get; set; } = "15:00";
    [Section("Rooms"), Multiline] public string Rooms { get; set; } = "…";
    [Section("Restaurant"), Multiline] public string Restaurant { get; set; } = "…";
    [Section("Spa"), Multiline] public string Spa { get; set; } = "…";
    [Section("Excursions"), Multiline] public string Excursions { get; set; } = "…";
    [Section("Departure"), Multiline] public string Departure { get; set; } = "…";
}
