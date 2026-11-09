// The C# twin (Mateu.NET): [Overline], [TitlePlaceholder], [Subtitle] on the class; [HeaderBadge]
// and [Timestamp] on properties; KPIs are [Kpi] methods in this port.
using Mateu.Uidl;

[UI("new-booking"), Overline("Reservations"), TitlePlaceholder("New booking…")]
[Subtitle("Fill in the guest to give the booking its name")]
public class NewBookingPage
{
    public string? Guest { get; set; }
    public string Room { get; set; } = "214";

    [HeaderBadge("success")] public string Status { get; set; } = "Confirmed";
    [HeaderBadge("warning", Label = "VIP")] public bool Vip { get; set; } = true;
    [Timestamp("Last updated")] public string UpdatedAt { get; set; } = "2026-11-08 09:30";

    [Kpi("Nights")] public string Nights() => "4";
    [Kpi("Total")] public string Total() => "€ 1,240";
}
