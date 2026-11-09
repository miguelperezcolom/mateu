package io.mateu.explorer.examples.behaviour.rowroute;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.TitleSupplier;

/**
 * The record a row leads to, at {@code x/behaviour/row-route/rooms/:id}: the {@code id} comes from
 * the path; the rest is loaded once the instance is hydrated.
 */
@ReadOnly
public class RoomRecord implements TitleSupplier, PostHydrationHandler {

  String id;

  String type;

  String status;

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    RoomList.ROOMS.stream()
        .filter(r -> r.id().equals(id))
        .findFirst()
        .ifPresent(
            room -> {
              type = room.type();
              status = room.status();
            });
  }

  @Override
  public String title() {
    return "Room " + id;
  }
}
