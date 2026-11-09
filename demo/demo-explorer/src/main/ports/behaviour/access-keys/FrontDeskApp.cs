// The C# twin (Mateu.NET): [App(…, AccessKeys = true)].
using Mateu.Uidl;

[App("Front desk", Variant = "MENU_ON_TOP", AccessKeys = true)]
public class FrontDeskApp
{
    [MenuItem("Check-in")] public CheckInPage CheckIn() => new();
}

[UI("check-in"), Title("Check-in")]
public class CheckInPage
{
    public string Guest { get; set; } = "Ada Lovelace";

    [Button] public Message AssignRoom() => new("Room assigned");
    [Button] public Message PrintCard() => new("Registration card printed");
}
