// The C# twin (Mateu.NET): [Text(Container, Size, NoMargins)] and [SeparatorBefore].
using Mateu.Uidl;

[UI("room-summary"), Title("Room 214")]
public class RoomSummary
{
    [Text(Container = "h3", Size = "xl")] public string Headline { get; set; } = "Sea-view double";
    [Text(Size = "xs", NoMargins = true)] public string Caption { get; set; } = "Last cleaned today at 11:20";
    public string Guest { get; set; } = "Ada Lovelace";
    public string Nights { get; set; } = "4";
    [SeparatorBefore] public string Minibar { get; set; } = "Restocked";
    public string Housekeeping { get; set; } = "Turndown at 19:00";
}
