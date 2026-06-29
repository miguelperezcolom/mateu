using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Mateu.Demo;

[UI(""), Title("Simple Form")]
public class SimpleForm
{
    [Required]
    public string? Name { get; set; }

    [Button]
    public Message Greet() => new($"Hello {Name}!");
}
