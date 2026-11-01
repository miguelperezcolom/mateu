package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.domain.ComponentState.wrap;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getFieldId;
import static io.mateu.core.domain.out.componentmapper.GridColumnBuilder.getDetailFormColumns;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
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

  /**
   * The class of a list's rows: the {@code <field>_rowClass} the state carries (wizard steps), else
   * the list's element type.
   */
  static Class<?> rowClass(Field field, String fieldId, HttpRequest httpRequest) {
    var stateRowClass = httpRequest.runActionRq().componentState().get(fieldId + "_rowClass");
    return stateRowClass != null
        ? io.mateu.core.application.security.WireTypes.rowClass(
            stateRowClass.toString(), field.getDeclaringClass())
        : getGenericClass(field, field.getType(), "E");
  }

  /**
   * The editor of a NEW row ("+", "Save and add another"), built on the row instance — so the row's
   * own suppliers ({@code VisibilitySupplier}, {@code ReadOnlySupplier}…) are asked about it — and
   * re-built by the server when a field its visibility depends on changes (see {@link
   * RowVisibilityTriggers}).
   */
  static ServerSideComponentDto newRowEditor(
      Field field, String fieldId, HttpRequest httpRequest, Object item) {
    String fid = getFieldId(field, "", false);
    var editor =
        wrap(
                buildDetailForm(
                    detailTitle("New", getGenericClass(field, field.getType(), "E")),
                    field,
                    item,
                    httpRequest,
                    true,
                    null,
                    List.<UserTrigger>of(),
                    rowEditorButtons(fid, "_create", true),
                    0),
                item,
                (String) httpRequest.getAttribute("baseUrl"),
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest)
            .withContainerId(fieldId + "-container");
    return RowVisibilityTriggers.addTo(editor, item, fid, httpRequest);
  }

  /**
   * The editor of an EXISTING row (Edit, Prev/Next), built on the row instance hydrated with that
   * row's values, its {@code data} (the row plus {@code _position}) as the initial state.
   */
  static ServerSideComponentDto editRowEditor(
      Field field, String fieldId, HttpRequest httpRequest, Object item, Map<String, Object> data) {
    String fid = getFieldId(field, "", false);
    var editor =
        wrap(
                buildDetailForm(
                    detailTitle("Edit", getGenericClass(field, field.getType(), "E")),
                    field,
                    item,
                    httpRequest,
                    false,
                    List.of(Text.builder().text("${state['_position']}").build()),
                    List.<UserTrigger>of(
                        Button.builder().label("Prev").actionId(fid + "_prev").build(),
                        Button.builder().label("Next").actionId(fid + "_next").build()),
                    rowEditorButtons(fid, "_save", false),
                    0),
                item,
                (String) httpRequest.getAttribute("baseUrl"),
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest)
            .withContainerId(fieldId + "-container")
            .withInitialData(data);
    return RowVisibilityTriggers.addTo(editor, item, fid, httpRequest);
  }

  /**
   * The row editor's form. Built on the row INSTANCE, not its class: a form built on the class
   * asked nobody whether a field shows, so a row's {@code VisibilitySupplier} was ignored and every
   * field of every row type appeared.
   */
  static Component buildDetailForm(
      String title,
      Field field,
      Object row,
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
                        row != null ? row : getGenericClass(field, field.getType(), "E"),
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
