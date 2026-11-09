// The pages the small C# demo apps of these entries navigate to.
using Mateu.Uidl;

[UI("rooms"), Title("Rooms")]
public class RoomsPage
{
    public string Room { get; set; } = "214";
    public string Status { get; set; } = "Ready";
}

[UI("guests"), Title("Guests")]
public class GuestsPage
{
    public string Guest { get; set; } = "Ada Lovelace";
}
