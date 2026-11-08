package io.mateu.explorer.examples.behaviour.peernav;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.List;

/**
 * Peer navigation: {@link PeerNavigationSupplier#peers} returns the previous and next record (label
 * + route); the page header draws ‹ › arrows that navigate like links. A {@code null} route
 * disables that side.
 */
@ReadOnly
public class GuestRecord implements PeerNavigationSupplier, TitleSupplier {

  static final List<String> GUESTS = List.of("Ada Lovelace", "Alan Turing", "Grace Hopper");

  /** from the route: {@code x/behaviour/peer-nav/guests/:id}, 1-based */
  int id = 1;

  String guest;

  @Override
  public String title() {
    guest = GUESTS.get(Math.max(1, Math.min(id, GUESTS.size())) - 1);
    return guest;
  }

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    var base = "/x/behaviour/peer-nav/guests/";
    return new PeerNav(
        id > 1 ? GUESTS.get(id - 2) : null,
        id > 1 ? base + (id - 1) : null,
        id < GUESTS.size() ? GUESTS.get(id) : null,
        id < GUESTS.size() ? base + (id + 1) : null);
  }
}
