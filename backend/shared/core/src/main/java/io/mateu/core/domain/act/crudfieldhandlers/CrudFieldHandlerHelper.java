package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.domain.out.componentmapper.GridColumnBuilder.getDetailFormColumns;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class CrudFieldHandlerHelper {

  static Map<String, Object> newStateMap(
      HttpRequest httpRequest, Map<String, Object> showDetail, Map<String, Object> editing) {
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    newState.put("_show_detail", showDetail);
    newState.put("_editing", editing);
    return newState;
  }

  static State buildState(
      HttpRequest httpRequest, Map<String, Object> showDetail, Map<String, Object> editing) {
    return new State(newStateMap(httpRequest, showDetail, editing));
  }

  static int findPositionByRowNumber(List<Map<String, Object>> items, Object rowNumber) {
    for (int i = 0; i < items.size(); i++) {
      if (rowNumber.equals(items.get(i).get("_rowNumber"))) {
        return i;
      }
    }
    throw new RuntimeException("Item with row number " + rowNumber + " not found");
  }

  /**
   * A row editor's title: the verb and the row's name as a person says it — "New room", "Edit room"
   * — not the class ("New RoomViewModel"). A row class that declares {@code @Title} is named by it.
   */
  static String detailTitle(String verb, Class<?> rowClass) {
    return verb + " " + rowName(rowClass);
  }

  static String rowName(Class<?> rowClass) {
    if (MetaAnnotations.isPresent(rowClass, Title.class)) {
      return MetaAnnotations.find(rowClass, Title.class).value();
    }
    var name = rowClass.getSimpleName().replaceAll("(ViewModel|View|Dto|DTO|Form|Row)$", "");
    if (name.isEmpty()) {
      name = rowClass.getSimpleName();
    }
    return name.replaceAll("([a-z0-9])([A-Z])", "$1 $2")
        .replaceAll("([A-Z])([A-Z][a-z])", "$1 $2")
        .toLowerCase();
  }

  /**
   * A row editor's own actions, at the foot of its form: Save first and primary, Cancel last and
   * tertiary. As a header toolbar they were unstyled secondaries, which the header collapses into
   * its "…" menu when they do not fit — always, inside a dialog that sizes to its content.
   */
  static List<UserTrigger> rowEditorButtons(String fid, String saveActionId, boolean another) {
    var buttons = new ArrayList<UserTrigger>();
    buttons.add(
        Button.builder()
            .label("Save")
            .actionId(fid + saveActionId)
            .buttonStyle(ButtonStyle.primary)
            .build());
    if (another) {
      buttons.add(
          Button.builder()
              .label("Save and add another")
              .actionId(fid + "_create-and-stay")
              .build());
    }
    buttons.add(
        Button.builder()
            .label("Cancel")
            .actionId(fid + "_cancel")
            .buttonStyle(ButtonStyle.tertiary)
            .build());
    return buttons;
  }

  static Component buildDetailForm(
      String title,
      Field field,
      HttpRequest httpRequest,
      boolean isNew,
      List<Component> header,
      List<UserTrigger> toolbar,
      List<UserTrigger> buttons,
      int level) {
    var builder =
        Form.builder()
            .title(title)
            .style("width: 100%;")
            .content(
                getForm(
                        "",
                        getGenericClass(field, field.getType(), "E"),
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        isNew,
                        false,
                        getDetailFormColumns(field),
                        level)
                    .stream()
                    .toList())
            .toolbar(toolbar)
            .buttons(buttons);
    if (header != null && !header.isEmpty()) {
      builder = builder.header(header);
    }
    return builder.build();
  }
}
