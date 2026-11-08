// The C# twin (Mateu.NET): [Shortcut] on an action, [OnRowSelected(…, Shortcut = …)] on a grid.
using Mateu.Uidl;

public record Arrival(string Guest, string Room);

[UI("arrivals"), Title("Arrivals")]
public class ArrivalsDesk
{
    [ReadOnly] public string Selected { get; set; } = "none";

    [ReadOnly, OnRowSelected("pick", Shortcut = "ctrl+shift")]
    public List<Arrival> Arrivals { get; set; } =
        [new("Ada Lovelace", "214"), new("Alan Turing", "118"), new("Grace Hopper", "305")];

    [Button, Shortcut("ctrl+alt+c")] public Message CheckIn() => new($"Checked in {Selected}");

    public ArrivalsDesk Pick(Arrival arrival)
    {
        Selected = arrival.Guest;
        return this;
    }
}
