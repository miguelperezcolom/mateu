package io.mateu.mdd.demovbpms.infra.in.ui.inventory;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.AvatarGroup;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CarouselLayout;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Room types (OPERA Cloud 26.3 user guide, 005 "Room Types": each type with its description and
 * its images, which OPERA shows to the agent while booking). One card per type with its photo
 * gallery — a {@link CarouselLayout} of {@link Image}s — and, on top, the housekeeping team on duty
 * as an {@link AvatarGroup}.
 */
@UI("/room-types")
@Title("Room types")
public class RoomTypes implements ComponentTreeSupplier {

  record RoomType(String code, String name, String description) {}

  static final List<RoomType> TYPES =
      List.of(
          new RoomType("STD", "Standard", "Queen bed, city view, 22 m²."),
          new RoomType("SUP", "Superior", "King bed or twins, balcony, 28 m²."),
          new RoomType("JRS", "Junior Suite", "Sitting area, sea view, 40 m²."),
          new RoomType("STE", "Suite", "Separate living room, terrace with sea view, 65 m²."));

  @Override
  public Component component(HttpRequest httpRequest) {
    List<Component> content = new ArrayList<>();
    content.add(new Text("Housekeeping team on duty"));
    content.add(
        new AvatarGroup(
            List.of(
                new Avatar("Lucía Martín"),
                new Avatar("Tomás Ruiz"),
                new Avatar("Ana Pons"),
                new Avatar("Jordi Serra"),
                new Avatar("Marta Gil"),
                new Avatar("Pau Vidal")),
            4));
    for (var type : TYPES) {
      long rooms = Hotel.ROOMS.stream().filter(r -> r.type().equals(type.code())).count();
      List<Component> gallery = new ArrayList<>();
      for (int i = 1; i <= 3; i++) {
        gallery.add(new Image("/pms/rooms/" + type.code().toLowerCase() + "-" + i + ".svg"));
      }
      content.add(
          Card.builder()
              .title(new Text(type.name() + " (" + type.code() + ")"))
              .content(
                  VerticalLayout.builder()
                      .content(
                          List.of(
                              CarouselLayout.builder().content(gallery).loop(true).nav(true).build(),
                              new Text(type.description() + " " + rooms + " rooms.")))
                      .build())
              .build());
    }
    return VerticalLayout.builder().content(content).build();
  }
}
