package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ResourceGrid;
import io.mateu.uidl.data.ResourceItem;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link ResourceGrid} component: a room availability picker. */
@UI("/resource-grid-demo")
@Title("Room picker")
public class RoomPicker {

  @Section("Asignación de habitación")
  Component rooms =
      ResourceGrid.builder()
          .actionId("pickRoom")
          .columns(4)
          .recommendedLabel("RECOMENDADA")
          .items(
              List.of(
                  ResourceItem.builder()
                      .id("1201")
                      .title("1201")
                      .subtitle("Ocupada")
                      .statusLabel("Sucia")
                      .statusColor("contrast")
                      .disabled(true)
                      .build(),
                  ResourceItem.builder()
                      .id("1202")
                      .title("1202")
                      .subtitle("Libre")
                      .statusLabel("Limpia")
                      .statusColor("success")
                      .build(),
                  ResourceItem.builder()
                      .id("1204")
                      .title("1204")
                      .subtitle("Ocean Suite")
                      .statusLabel("Inspeccionada")
                      .statusColor("success")
                      .recommended(true)
                      .selected(true)
                      .build(),
                  ResourceItem.builder()
                      .id("1206")
                      .title("1206")
                      .subtitle("Libre")
                      .statusLabel("Limpia")
                      .statusColor("success")
                      .note("Ducha averiada")
                      .noteColor("error")
                      .build()))
          .build();

  @Action
  Object pickRoom() {
    return new Message("This would assign the selected room");
  }
}
