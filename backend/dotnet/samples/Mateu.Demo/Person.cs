using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Mateu.Demo;

public enum Role { Guest, Member, Admin }

[UI("person"), Title("Person"), Subtitle("Personal data")]
public class Person
{
    [Banner(BannerTheme.Info, "Heads up")]
    public string Note() => "Fields marked * are required.";

    [Required, Section("Identity")]
    public string? Name { get; set; }

    public int Age { get; set; }

    [Section("Preferences")]
    public bool Subscribed { get; set; }

    public DateOnly BirthDate { get; set; }

    public Role Role { get; set; }

    [Button]
    public Message Save() => new($"Saved {Name} (age {Age}, role {Role})");
}
