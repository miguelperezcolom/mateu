package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ButtonsSupplier;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.stream.Stream;

final class PageButtonsBuilder {

  static Collection<? extends UserTrigger> getButtons(Object instance) {
    if (instance instanceof ButtonsSupplier buttonsSupplier) {
      return buttonsSupplier.buttons();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .map(field -> getButton(field)),
            getAllMethods(instance.getClass()).stream()
                .filter(
                    method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .map(method -> getButton(method)))
        .toList();
  }

  static Collection<? extends UserTrigger> getToolbar(Object instance) {
    if (instance instanceof ToolbarSupplier toolbarSupplier) {
      return toolbarSupplier.toolbar();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(Toolbar.class))
                .map(field -> getButton(field)),
            getAllMethods(instance.getClass()).stream()
                .filter(method -> method.isAnnotationPresent(Toolbar.class))
                .map(method -> getButton(method)))
        .toList();
  }

  private static Button getButton(Method method) {
    return Button.builder().label(getLabelForMethod(method)).actionId(method.getName()).build();
  }

  private static Button getButton(Field field) {
    return Button.builder().label(getLabel(field)).actionId(field.getName()).build();
  }

  private static String getLabelForMethod(Method method) {
    if (method.isAnnotationPresent(Label.class)) {
      return method.getAnnotation(Label.class).value();
    }
    return toUpperCaseFirst(method.getName());
  }
}
