using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Mateu.Demo;

public enum Role { Guest, Member, Admin }

[UI("person"), Title("Person")]
public class Person
{
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
