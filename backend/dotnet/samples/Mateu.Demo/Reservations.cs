using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Mateu.Demo;

public class Reservation
{
    public string Id { get; set; } = "";
    [Required] public string Locator { get; set; } = "";
    [Required] public string Hotel { get; set; } = "";
    public string Guest { get; set; } = "";
    public DateOnly Arrival { get; set; }
}

[UI("reservations"), Title("Reservations")]
public class Reservations : Crud<Reservation>
{
    private static readonly List<Reservation> Store =
    [
        new() { Id = "1", Locator = "RES-0001", Hotel = "Grand Palace Hotel", Guest = "García López, Ana", Arrival = new(2026, 6, 28) },
        new() { Id = "2", Locator = "RES-0002", Hotel = "Grand Palace Hotel", Guest = "Smith, John", Arrival = new(2026, 6, 28) },
        new() { Id = "3", Locator = "RES-0003", Hotel = "Ocean View Resort", Guest = "Müller, Hans", Arrival = new(2026, 6, 29) },
        new() { Id = "4", Locator = "RES-0004", Hotel = "Ocean View Resort", Guest = "Dupont, Marie", Arrival = new(2026, 6, 30) },
        new() { Id = "5", Locator = "RES-0005", Hotel = "Grand Palace Hotel", Guest = "Fernández Ruiz, Carlos", Arrival = new(2026, 7, 1) },
    ];

    public override IEnumerable<Reservation> Fetch(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Store
            : Store.Where(r =>
                r.Locator.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Hotel.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Guest.Contains(search, StringComparison.OrdinalIgnoreCase));

    public override Reservation? Get(string id) => Store.FirstOrDefault(r => r.Id == id);

    public override void Save(Reservation e)
    {
        var existing = Store.FirstOrDefault(r => r.Id == e.Id);
        if (existing is null)
        {
            e.Id = (Store.Select(r => int.Parse(r.Id)).DefaultIfEmpty(0).Max() + 1).ToString();
            Store.Add(e);
        }
        else
        {
            existing.Locator = e.Locator;
            existing.Hotel = e.Hotel;
            existing.Guest = e.Guest;
            existing.Arrival = e.Arrival;
        }
    }

    public override void Delete(string id) => Store.RemoveAll(r => r.Id == id);
}
