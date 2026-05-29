package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.UserTrigger;
import java.util.ArrayList;
import java.util.List;

public final class FormViewToolbarBuilder {

  public static List<UserTrigger> createToolbar(Object instance) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method ->
                toolbar.add(new Button(toUpperCaseFirst(method.getName()), method.getName())));
    return toolbar;
  }

  public static List<UserTrigger> createButtons(Object instance) {
    var buttons = new ArrayList<UserTrigger>();
    getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
        .forEach(
            method ->
                buttons.add(new Button(toUpperCaseFirst(method.getName()), method.getName())));
    return buttons;
  }

  private FormViewToolbarBuilder() {}
}
