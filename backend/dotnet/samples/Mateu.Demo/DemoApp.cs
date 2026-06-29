using Mateu.Uidl;

namespace Mateu.Demo;

[App("My C# Mateu app")]
public class DemoApp
{
    [MenuItem("Reservations")] public Reservations Reservations() => new();
    [MenuItem("Simple form")] public SimpleForm SimpleForm() => new();
    [MenuItem("Person")] public Person Person() => new();
}
