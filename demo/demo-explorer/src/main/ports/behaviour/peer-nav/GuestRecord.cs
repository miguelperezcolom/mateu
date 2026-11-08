// The C# twin (Mateu.NET): IPeerNavigationSupplier.Peers() returns the same PeerNav.
using Mateu.Uidl;

[UI("guests/:id"), ReadOnly]
public class GuestRecord : IPeerNavigationSupplier
{
    static readonly string[] Guests = ["Ada Lovelace", "Alan Turing", "Grace Hopper"];

    public int Id { get; set; } = 1;

    public PeerNav? Peers() => new(
        Id > 1 ? Guests[Id - 2] : null, Id > 1 ? $"/guests/{Id - 1}" : null,
        Id < Guests.Length ? Guests[Id] : null, Id < Guests.Length ? $"/guests/{Id + 1}" : null);
}
