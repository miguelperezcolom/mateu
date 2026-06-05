package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.RunMethodActionRunner.invoke;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.CustomEvent;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.Selector;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

public abstract class Listing<Filters, Row>
    implements ListingBackend<Filters, Row>, ActionSupplier {

  private String _fieldId;

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    actions.addAll(ListingBackend.super.actions(httpRequest));
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method -> {
              actions.add(Action.builder().id(method.getName()).build());
            });
    if (this instanceof Selector<?>) {
      actions.add(Action.builder().id("action-on-row-select").build());
    }
    return actions;
  }

  @SneakyThrows
  @Override
  public Object handleActionOnRow(String methodName, HttpRequest httpRequest) {
    if (methodName.equals("select") && this instanceof Selector<?> selector) {
      var selectedItem = selector.selected(httpRequest);
      return List.of(
          UICommand.builder()
              .type(UICommandType.DispatchEvent)
              .data(
                  CustomEvent.builder()
                      .eventName("value-changed")
                      .detail(
                          Map.of(
                              "fieldId", selector.fieldId(),
                              "value", selectedItem.id()))
                      .build())
              .build(),
          UICommand.builder()
              .type(UICommandType.DispatchEvent)
              .data(
                  CustomEvent.builder()
                      .eventName("data-changed")
                      .detail(
                          Map.of(
                              "key", selector.fieldId() + "-label", "value", selectedItem.label()))
                      .build())
              .build(),
          UICommand.builder()
              .type(UICommandType.DispatchEvent)
              .data(CustomEvent.builder().eventName("close-modal-requested").build())
              .build());
    }
    for (Method method : getAllMethods(getClass()).reversed()) {
      if (methodName.equals(method.getName())) {
        method.setAccessible(true);
        var rq = httpRequest.runActionRq();
        var command =
            new RunActionCommand(
                "base_url",
                "uiId",
                rq.route(),
                rq.consumedRoute(),
                rq.actionId(),
                rq.componentState(),
                rq.appState(),
                rq.initiatorComponentId(),
                httpRequest,
                rq.serverSideType(),
                rq.serverSideComponentRoute());
        Object result = invoke(method, this, command);
        if (result != null) {
          return result;
        }
        break;
      }
    }
    return null;
  }

  public String fieldId() {
    return _fieldId;
  }

  public Selector withFieldId(String fieldId) {
    _fieldId = fieldId;
    return (Selector) this;
  }

  public boolean pdfExportable() {
    return false;
  }

  public boolean excelExportable() {
    return false;
  }

  public boolean csvExportable() {
    return false;
  }
}
