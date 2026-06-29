using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Mateu.Demo;

[UI("simple-form"), Title("Simple Form")]
[Emits("greeting-sent")]
[SubscribeTo("refresh", "greet")]
public class SimpleForm
{
    [Required]
    public string? Name { get; set; }

    [Button]
    public Message Greet() => new($"Hello {Name}!");
}
