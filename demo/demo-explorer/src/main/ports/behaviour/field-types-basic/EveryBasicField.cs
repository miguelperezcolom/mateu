// The C# twin (Mateu.NET): the widget from the property type; [Stereotype("…")] for another one.
using Mateu.Uidl;

[UI("every-basic-field"), Title("Every basic field")]
public class EveryBasicField
{
    public string? Text { get; set; } = "Hello";
    public int Integer { get; set; } = 42;
    public double Decimal { get; set; } = 3.14;
    public bool Flag { get; set; } = true;
    public DateOnly Date { get; set; } = new(2026, 11, 8);
    public TimeOnly Time { get; set; } = new(9, 30);
    public DateTime DateTime { get; set; } = new(2026, 11, 8, 9, 30, 0);

    [Stereotype("email")] public string? Email { get; set; } = "ada@example.com";
    [Password] public string? Password { get; set; } = "secret";
    [Stereotype("textarea")] public string? Notes { get; set; }
    [Stereotype("toggle")] public bool Active { get; set; } = true;
    [Stereotype("stars")] public int Rating { get; set; } = 4;
    [Stereotype("slider"), SliderMin(0), SliderMax(100)] public int Volume { get; set; } = 30;

    [Button] public Message Show() => new($"integer={Integer} date={Date} rating={Rating} volume={Volume}");
}
