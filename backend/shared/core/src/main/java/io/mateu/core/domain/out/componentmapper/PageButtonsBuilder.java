package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ButtonsSupplier;
import io.mateu.uidl.interfaces.DisabledSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.stream.Stream;

final class PageButtonsBuilder {

  static Collection<? extends UserTrigger> getButtons(Object instance, HttpRequest httpRequest) {
    if (instance instanceof ButtonsSupplier buttonsSupplier) {
      return buttonsSupplier.buttons();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .filter(
                    field ->
                        !field.isAnnotationPresent(Hidden.class)
                            || !field.getAnnotation(Hidden.class).value().isEmpty())
                .filter(
                    field ->
                        !(instance instanceof VisibilitySupplier vs)
                            || !vs.isHidden(field.getName(), httpRequest))
                .map(
                    field ->
                        getButton(
                            field,
                            instance instanceof DisabledSupplier ds
                                && ds.isDisabled(field.getName(), httpRequest))),
            getAllMethods(instance.getClass()).stream()
                .filter(
                    method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .filter(
                    method ->
                        !method.isAnnotationPresent(Hidden.class)
                            || !method.getAnnotation(Hidden.class).value().isEmpty())
                .filter(
                    method ->
                        !(instance instanceof VisibilitySupplier vs)
                            || !vs.isHidden(method.getName(), httpRequest))
                .map(
                    method ->
                        getButton(
                            method,
                            instance instanceof DisabledSupplier ds
                                && ds.isDisabled(method.getName(), httpRequest))))
        .toList();
  }

  static Collection<? extends UserTrigger> getToolbar(Object instance, HttpRequest httpRequest) {
    if (instance instanceof ToolbarSupplier toolbarSupplier) {
      return toolbarSupplier.toolbar();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(Toolbar.class))
                .filter(
                    field ->
                        !field.isAnnotationPresent(Hidden.class)
                            || !field.getAnnotation(Hidden.class).value().isEmpty())
                .filter(
                    field ->
                        !(instance instanceof VisibilitySupplier vs)
                            || !vs.isHidden(field.getName(), httpRequest))
                .map(
                    field ->
                        getButton(
                            field,
                            instance instanceof DisabledSupplier ds
                                && ds.isDisabled(field.getName(), httpRequest))),
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
                .map(
                    method ->
                        getButton(
                            method,
                            instance instanceof DisabledSupplier ds
                                && ds.isDisabled(method.getName(), httpRequest))))
        .toList();
  }

  private static Button getButton(Method method, boolean disabled) {
    var ann = method.getAnnotation(Toolbar.class);
    var buttonStyle =
        ann != null && ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
    var buttonColor =
        ann != null && ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
    var buttonSize = ann != null && ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : null;
    return Button.builder()
        .label(getLabelForMethod(method))
        .actionId(method.getName())
        .disabled(disabled)
        .buttonStyle(buttonStyle)
        .color(buttonColor)
        .size(buttonSize)
        .build();
  }

  private static Button getButton(Field field, boolean disabled) {
    var ann = field.getAnnotation(Toolbar.class);
    var buttonStyle =
        ann != null && ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
    var buttonColor =
        ann != null && ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
    var buttonSize = ann != null && ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : null;
    return Button.builder()
        .label(getLabel(field))
        .actionId(field.getName())
        .disabled(disabled)
        .buttonStyle(buttonStyle)
        .color(buttonColor)
        .size(buttonSize)
        .build();
  }

  private static String getLabelForMethod(Method method) {
    if (method.isAnnotationPresent(Label.class)) {
      return method.getAnnotation(Label.class).value();
    }
    return toUpperCaseFirst(method.getName());
  }
}
