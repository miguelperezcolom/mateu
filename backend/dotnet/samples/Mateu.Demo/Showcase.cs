using Mateu.Uidl;

namespace Mateu.Demo;

// Exercises the tail features: tabs, field stereotypes, KPIs, FABs, button shortcuts,
// compact rendering and the unsaved-changes navigation guard.
[UI("showcase"), Title("Showcase"), Subtitle("Tail features"), Compact, ConfirmOnNavigationIfDirty]
public class Showcase
{
    [Tab("Identity")] public string? Name { get; set; }
    [Tab("Identity"), Password] public string? Secret { get; set; }

    [Tab("Profile"), Multiline] public string? Bio { get; set; }
    [Tab("Profile"), Money] public decimal Salary { get; set; }
    [Tab("Profile"), PlainText] public string? MemberSince { get; set; } = "2021-03-14";
    [Tab("Profile"), LinkTo("https://mateu.io/${state.name}", Icon = "vaadin:external-link", Target = "_blank")]
    public string? Homepage { get; set; }

    [Kpi("Open tickets")] public string OpenTickets() => "42";
    [Kpi("Revenue")] public string Revenue() => "€ 1.2M";

    [Fab("plus", "Add", 0)] public Message Add() => new("Added");

    [Button, Shortcut("ctrl+s")] public Message Save() => new($"Saved {Name}");
}
