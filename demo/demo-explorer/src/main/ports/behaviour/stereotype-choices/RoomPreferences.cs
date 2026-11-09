// The C# twin (Mateu.NET): the same inference (≤ 4 constants → radios), the same humanised
// constant names; [Label] on an enum field wins.
using Mateu.Uidl;

public enum Bed { Single, Double, TwinBeds }

public enum Floor { Ground, First, Second, Third, Fourth, [Label("Penthouse ✨")] Top }

[UI("room-preferences"), Title("Room preferences")]
public class RoomPreferences
{
    public Bed Bed { get; set; } = Bed.Double;

    public Floor Floor { get; set; } = Floor.First;

    [UseRadioButtons] public Floor? AlternativeFloor { get; set; }

    [Button] public Message Save() => new($"Bed {Bed}, floor {Floor}");
}
