package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.NotEditable;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.ArrayList;
import java.util.List;

final class ViewToolbarBuilder {

  static List<UserTrigger> createViewToolbar(
      Object item, Crud orchestrator, HttpRequest httpRequest) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(orchestrator.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
        .forEach(
            method ->
                toolbar.add(
                    new Button(
                        toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName())));
    var entity = item;
    if (entity instanceof AutoNamedView<?> autoNamedView) {
      entity = autoNamedView.entity();
    }
    final var finalEntity = entity;
    getAllMethods(entity.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .filter(
            method ->
                !method.isAnnotationPresent(Hidden.class)
                    || !method.getAnnotation(Hidden.class).value().isEmpty())
        .filter(
            method ->
                !(finalEntity instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .forEach(
            method -> {
              var ann = method.getAnnotation(Toolbar.class);
              var buttonStyle = ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
              var buttonColor = ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
              var buttonSize = ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : null;
              toolbar.add(
                  Button.builder()
                      .label(toUpperCaseFirst(method.getName()))
                      .actionId(method.getName())
                      .buttonStyle(buttonStyle)
                      .color(buttonColor)
                      .size(buttonSize)
                      .build());
            });
    if (!orchestrator.getClass().isAnnotationPresent(SplitCrud.class)) {
      toolbar.add(new Button(orchestrator.backToListLabel(), "cancel-view"));
    }
    if (!orchestrator.readOnly()) {
      toolbar.add(new Button(orchestrator.addAnotherLabel(), "new"));
    }
    if (!viewReadOnly(item, orchestrator)) {
      toolbar.add(new Button(orchestrator.editLabel(), "edit"));
    }
    return toolbar;
  }

  private static boolean viewReadOnly(Object item, Crud orchestrator) {
    if (orchestrator.readOnly()) return true;
    if (orchestrator.getClass().isAnnotationPresent(NotEditable.class)) return true;
    if (orchestrator.viewClass().isAnnotationPresent(io.mateu.uidl.annotations.ReadOnly.class))
      return true;
    if (item != null
        && item.getClass().isAnnotationPresent(io.mateu.uidl.annotations.ReadOnly.class))
      return true;
    if (item instanceof ModelSupplier modelSupplier) {
      return modelSupplier
          .model()
          .getClass()
          .isAnnotationPresent(io.mateu.uidl.annotations.ReadOnly.class);
    }
    return false;
  }

  private ViewToolbarBuilder() {}
}
