package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.ArrayList;
import java.util.List;

public final class FormViewToolbarBuilder {

  public static List<UserTrigger> createToolbar(Object instance, HttpRequest httpRequest) {
    return createToolbar("", instance, httpRequest);
  }

  public static List<UserTrigger> createToolbar(
      String prefix, Object instance, HttpRequest httpRequest) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .filter(
            method ->
                !method.isAnnotationPresent(Hidden.class)
                    || !method.getAnnotation(Hidden.class).value().isEmpty())
        .filter(
            method ->
                !(instance instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .forEach(
            method -> {
              var action = method.getAnnotation(Action.class);
              var shortcut =
                  action != null && !action.shortcut().isEmpty() ? action.shortcut() : null;
              var ann = method.getAnnotation(Toolbar.class);
              var buttonStyle = ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
              toolbar.add(
                  Button.builder()
                      .label(toUpperCaseFirst(method.getName()))
                      .actionId(prefix + method.getName())
                      .shortcut(shortcut)
                      .buttonStyle(buttonStyle)
                      .build());
            });
    return toolbar;
  }

  public static List<UserTrigger> createButtons(Object instance, HttpRequest httpRequest) {
    return createButtons("", instance, httpRequest);
  }

  public static List<UserTrigger> createButtons(
      String prefix, Object instance, HttpRequest httpRequest) {
    var buttons = new ArrayList<UserTrigger>();
    getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
        .filter(
            method ->
                !method.isAnnotationPresent(Hidden.class)
                    || !method.getAnnotation(Hidden.class).value().isEmpty())
        .filter(
            method ->
                !(instance instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .forEach(
            method -> {
              var action = method.getAnnotation(Action.class);
              var shortcut =
                  action != null && !action.shortcut().isEmpty() ? action.shortcut() : null;
              buttons.add(
                  new Button(
                      toUpperCaseFirst(method.getName()), prefix + method.getName(), shortcut));
            });
    return buttons;
  }

  private FormViewToolbarBuilder() {}
}
