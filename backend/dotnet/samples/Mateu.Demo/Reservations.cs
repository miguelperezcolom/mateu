using Mateu.Uidl;

namespace Mateu.Demo;

public record Reservation(string Id, string Locator, string Hotel, string Guest, DateOnly Arrival);

[UI("reservations"), Title("Reservations")]
public class Reservations : Crud<Reservation>
{
    private static readonly List<Reservation> Data =
    [
        new("1", "RES-0001", "Grand Palace Hotel", "García López, Ana", new DateOnly(2026, 6, 28)),
        new("2", "RES-0002", "Grand Palace Hotel", "Smith, John", new DateOnly(2026, 6, 28)),
        new("3", "RES-0003", "Ocean View Resort", "Müller, Hans", new DateOnly(2026, 6, 29)),
        new("4", "RES-0004", "Ocean View Resort", "Dupont, Marie", new DateOnly(2026, 6, 30)),
        new("5", "RES-0005", "Grand Palace Hotel", "Fernández Ruiz, Carlos", new DateOnly(2026, 7, 1)),
    ];

    public override IEnumerable<Reservation> Fetch(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Data
            : Data.Where(r =>
                r.Locator.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Hotel.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Guest.Contains(search, StringComparison.OrdinalIgnoreCase));
}
