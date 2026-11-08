# The Python twin (mateu-ui): PeerNavigationSupplier.peers() returns the same PeerNav.
from mateu_ui.uidl import PeerNav, PeerNavigationSupplier, read_only, ui

GUESTS = ["Ada Lovelace", "Alan Turing", "Grace Hopper"]


@ui("guests/:id")
@read_only
class GuestRecord(PeerNavigationSupplier):
    id: int = 1

    def peers(self) -> PeerNav:
        return PeerNav(
            prev_label=GUESTS[self.id - 2] if self.id > 1 else None,
            prev_route=f"/guests/{self.id - 1}" if self.id > 1 else None,
            next_label=GUESTS[self.id] if self.id < len(GUESTS) else None,
            next_route=f"/guests/{self.id + 1}" if self.id < len(GUESTS) else None,
        )
