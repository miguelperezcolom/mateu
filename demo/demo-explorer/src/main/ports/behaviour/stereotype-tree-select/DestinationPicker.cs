// The C# twin (Mateu.NET): [TreeSelect] + an IOptionsSupplier whose options carry Children.
using Mateu.Uidl;

[UI("destination"), Title("Destination")]
public class DestinationPicker : IOptionsSupplier
{
    [TreeSelect] public string? Region { get; set; }

    [TreeSelect(leavesOnly: true)] public string? Island { get; set; }

    public IReadOnlyList<Option> Options(string fieldName) =>
    [
        new("es", "Spain",
        [
            new("baleares", "Balearic Islands", [new("mallorca", "Mallorca"), new("menorca", "Menorca")]),
            new("canarias", "Canary Islands", [new("tenerife", "Tenerife"), new("lanzarote", "Lanzarote")]),
        ]),
        new("pt", "Portugal", [new("madeira", "Madeira"), new("azores", "Azores")]),
    ];

    [Button] public Message Go() => new($"Region: {Region} · island: {Island}");
}
