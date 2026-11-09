// The C# twin (Mateu.NET): the same archetype — Button properties are the hero's calls to action,
// [Panel] properties the highlight tiles; the Hero* members are the hooks.
using Mateu.Uidl;

[UI("welcome")]
public class MuseumWelcome : Welcome
{
    public Button Visit { get; } = new("Plan your visit", "planVisit") { Primary = true };

    public Button Collection { get; } = new("Browse the collection", "browse");

    [Panel(Title = "Open today")]
    public Markdown Hours { get; } = new() { MarkdownText = "10:00 – 18:00 · late opening on Fridays until 21:00" };

    [Panel(Title = "On view")]
    public Markdown OnView { get; } = new() { MarkdownText = "**Impressions of light** — 64 paintings, until 12 January" };

    [Panel(Title = "Members")]
    public Markdown Members { get; } = new() { MarkdownText = "Free entry, previews and 10% in the shop." };

    protected override string? HeroOverline => "Good morning";
    protected override string? HeroTitle => "Welcome to the City Museum";
    protected override string? HeroSubtitle => "Five thousand years of art, three floors, one afternoon";
    protected override HeroTone HeroTone => HeroTone.Plum;

    public Message PlanVisit() => new("Your visit planner would open here.", MessageVariant.Success);

    public Message Browse() => new("The collection would open here.", MessageVariant.Info);
}
