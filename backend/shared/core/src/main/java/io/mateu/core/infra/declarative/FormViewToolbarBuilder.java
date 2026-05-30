package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.UserTrigger;
import java.util.ArrayList;
import java.util.List;

public final class FormViewToolbarBuilder {

  public static List<UserTrigger> createToolbar(Object instance) {
    return createToolbar("", instance);
  }

  public static List<UserTrigger> createToolbar(String prefix, Object instance) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method -> {
              var action = method.getAnnotation(Action.class);
              var shortcut = action != null && !action.shortcut().isEmpty() ? action.shortcut() : null;
              toolbar.add(new Button(toUpperCaseFirst(method.getName()), prefix + method.getName(), shortcut));
            });
    return toolbar;
  }

  public static List<UserTrigger> createButtons(Object instance) {
    return createButtons("", instance);
  }

  public static List<UserTrigger> createButtons(String prefix, Object instance) {
    var buttons = new ArrayList<UserTrigger>();
    getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
        .forEach(
            method -> {
              var action = method.getAnnotation(Action.class);
              var shortcut = action != null && !action.shortcut().isEmpty() ? action.shortcut() : null;
              buttons.add(new Button(toUpperCaseFirst(method.getName()), prefix + method.getName(), shortcut));
            });
    return buttons;
  }

  private FormViewToolbarBuilder() {}
}
