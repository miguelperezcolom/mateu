// The C# twin (Mateu.NET): [Banner(theme, title)] methods return the description.
using Mateu.Uidl;

[UI("front-desk"), Title("Front desk")]
public class MaintenanceNotices
{
    public string Room { get; set; } = "214";

    [Banner(BannerTheme.Info, "Lift maintenance")]
    public string Lift() => "The east lift is out of service until 14:00.";

    [Banner(BannerTheme.Warning, "Overbooking risk")]
    public string Overbooking() => "Saturday is at 103% — confirm the walk-in policy.";
}
