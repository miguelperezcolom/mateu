package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.domain.Authorizer;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ButtonsSupplier;
import io.mateu.uidl.interfaces.DisabledSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Stream;

final class PageButtonsBuilder {

  private record RawButton(
      String label,
      String actionId,
      boolean disabled,
      ButtonStyle buttonStyle,
      ButtonColor buttonColor,
      ButtonSize buttonSize,
      String group,
      boolean separatorBefore,
      int order) {}

  static Collection<? extends UserTrigger> getButtons(Object instance, HttpRequest httpRequest) {
    if (instance instanceof ButtonsSupplier buttonsSupplier) {
      return buttonsSupplier.buttons();
    }
    return collect(instance, httpRequest, io.mateu.uidl.annotations.Button.class);
  }

  static Collection<? extends UserTrigger> getToolbar(Object instance, HttpRequest httpRequest) {
    if (instance instanceof ToolbarSupplier toolbarSupplier) {
      return toolbarSupplier.toolbar();
    }
    return collect(instance, httpRequest, Toolbar.class);
  }

  /**
   * Collects the buttons declared by the {@code marker} annotation ({@code @Button} or
   * {@code @Toolbar}) on the instance's visible fields and methods, then groups them. {@code
   * getButtons} and {@code getToolbar} differ only in this marker (and the supplier short-circuit
   * above).
   */
  private static Collection<? extends UserTrigger> collect(
      Object instance, HttpRequest httpRequest, Class<? extends Annotation> marker) {
    var rawButtons =
        Stream.concat(
                annotatedFields(instance, httpRequest, marker),
                annotatedMethods(instance, httpRequest, marker))
            .toList();
    return groupRawButtons(rawButtons);
  }

  private static Stream<RawButton> annotatedFields(
      Object instance, HttpRequest httpRequest, Class<? extends Annotation> marker) {
    return getAllFields(instance.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, marker))
        .filter(field -> isVisible(instance, field, httpRequest))
        .map(field -> getRawButtonFromField(field, isDisabled(instance, field, httpRequest)));
  }

  private static Stream<RawButton> annotatedMethods(
      Object instance, HttpRequest httpRequest, Class<? extends Annotation> marker) {
    return getAllMethods(instance.getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, marker))
        .filter(method -> isVisible(instance, method, httpRequest))
        .map(
            method ->
                getRawButtonFromMethod(method, marker, isDisabled(instance, method, httpRequest)));
  }

  /** A field/method contributes a button unless it is {@code @Hidden} or hidden by a supplier. */
  private static boolean isVisible(Object instance, Member member, HttpRequest httpRequest) {
    var element = (AnnotatedElement) member;
    boolean notHidden =
        !MetaAnnotations.isPresent(element, Hidden.class)
            || !MetaAnnotations.find(element, Hidden.class).value().isEmpty();
    boolean notHiddenBySupplier =
        !(instance instanceof VisibilitySupplier vs) || !vs.isHidden(member.getName(), httpRequest);
    return notHidden && notHiddenBySupplier;
  }

  /**
   * Disabled by a {@link DisabledSupplier} on the instance or an unsatisfied {@link
   * DisabledUnless}.
   */
  private static boolean isDisabled(Object instance, Member member, HttpRequest httpRequest) {
    return (instance instanceof DisabledSupplier ds && ds.isDisabled(member.getName(), httpRequest))
        || disabledByPermission((AnnotatedElement) member, httpRequest);
  }

  /** Disabled when a {@link DisabledUnless} on the button field/method is not satisfied. */
  private static boolean disabledByPermission(AnnotatedElement element, HttpRequest httpRequest) {
    return MetaAnnotations.isPresent(element, DisabledUnless.class)
        && !Authorizer.isAuthorized(
            MetaAnnotations.find(element, DisabledUnless.class), httpRequest);
  }

  private static Collection<? extends UserTrigger> groupRawButtons(List<RawButton> rawButtons) {
    var sorted = rawButtons.stream().sorted(Comparator.comparingInt(RawButton::order)).toList();
    var grouped = new LinkedHashMap<String, List<RawButton>>();
    for (var raw : sorted) {
      String key = raw.group().isEmpty() ? "__solo__" + raw.actionId() : raw.group();
      grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(raw);
    }

    List<UserTrigger> result = new ArrayList<>();
    for (var entry : grouped.entrySet()) {
      List<RawButton> group = entry.getValue();
      if (group.size() == 1 && group.get(0).group().isEmpty()) {
        var r = group.get(0);
        result.add(
            Button.builder()
                .label(r.label())
                .actionId(r.actionId())
                .disabled(r.disabled())
                .buttonStyle(r.buttonStyle())
                .color(r.buttonColor())
                .size(r.buttonSize())
                .separatorBefore(r.separatorBefore())
                .build());
      } else {
        var first = group.get(0);
        result.add(
            ButtonGroup.builder()
                .id(first.group())
                .label(toUpperCaseFirst(first.group()))
                .separatorBefore(first.separatorBefore())
                .buttons(
                    group.stream()
                        .map(
                            r ->
                                Button.builder()
                                    .label(r.label())
                                    .actionId(r.actionId())
                                    .disabled(r.disabled())
                                    .buttonStyle(r.buttonStyle())
                                    .color(r.buttonColor())
                                    .size(r.buttonSize())
                                    .build())
                        .toList())
                .build());
      }
    }
    return result;
  }

  private static RawButton getRawButtonFromMethod(
      Method method, Class<?> annotationClass, boolean disabled) {
    String group = "";
    boolean separatorBefore = false;
    int order = 0;
    ButtonStyle buttonStyle = null;
    ButtonColor buttonColor = null;
    ButtonSize buttonSize = null;

    if (annotationClass == Toolbar.class) {
      var ann = MetaAnnotations.find(method, Toolbar.class);
      if (ann != null) {
        buttonStyle = ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
        buttonColor = ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
        buttonSize = ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : null;
        group = ann.group();
        separatorBefore = ann.separatorBefore();
        order = ann.order();
      }
    } else {
      var ann = MetaAnnotations.find(method, io.mateu.uidl.annotations.Button.class);
      if (ann != null) {
        buttonStyle = ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
        buttonColor = ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
        buttonSize = ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : null;
        group = ann.group();
        separatorBefore = ann.separatorBefore();
        order = ann.order();
      }
    }

    return new RawButton(
        getLabelForMethod(method),
        method.getName(),
        disabled,
        buttonStyle,
        buttonColor,
        buttonSize,
        group,
        separatorBefore,
        order);
  }

  private static RawButton getRawButtonFromField(Field field, boolean disabled) {
    String group = "";
    boolean separatorBefore = false;
    int order = 0;
    ButtonStyle buttonStyle = null;
    ButtonColor buttonColor = null;
    ButtonSize buttonSize = null;

    var toolbarAnn = MetaAnnotations.find(field, Toolbar.class);
    var buttonAnn = MetaAnnotations.find(field, io.mateu.uidl.annotations.Button.class);

    if (toolbarAnn != null) {
      buttonStyle = toolbarAnn.buttonStyle() != ButtonStyle.none ? toolbarAnn.buttonStyle() : null;
      buttonColor = toolbarAnn.buttonColor() != ButtonColor.none ? toolbarAnn.buttonColor() : null;
      buttonSize = toolbarAnn.buttonSize() != ButtonSize.none ? toolbarAnn.buttonSize() : null;
      group = toolbarAnn.group();
      separatorBefore = toolbarAnn.separatorBefore();
      order = toolbarAnn.order();
    } else if (buttonAnn != null) {
      buttonStyle = buttonAnn.buttonStyle() != ButtonStyle.none ? buttonAnn.buttonStyle() : null;
      buttonColor = buttonAnn.buttonColor() != ButtonColor.none ? buttonAnn.buttonColor() : null;
      buttonSize = buttonAnn.buttonSize() != ButtonSize.none ? buttonAnn.buttonSize() : null;
      group = buttonAnn.group();
      separatorBefore = buttonAnn.separatorBefore();
      order = buttonAnn.order();
    }

    return new RawButton(
        getLabel(field),
        field.getName(),
        disabled,
        buttonStyle,
        buttonColor,
        buttonSize,
        group,
        separatorBefore,
        order);
  }

  static List<? extends UserTrigger> getFabs(Object instance, HttpRequest httpRequest) {
    return getAllMethods(instance.getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, Fab.class))
        .filter(
            method ->
                !(instance instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .sorted(
            java.util.Comparator.comparingInt(
                method -> MetaAnnotations.find(method, Fab.class).order()))
        .map(
            method -> {
              var ann = MetaAnnotations.find(method, Fab.class);
              var buttonStyle =
                  ann.buttonStyle() != io.mateu.uidl.data.ButtonStyle.none
                      ? ann.buttonStyle()
                      : io.mateu.uidl.data.ButtonStyle.primary;
              return Button.builder()
                  .actionId(method.getName())
                  .label(getLabelForMethod(method))
                  .iconOnLeft(ann.icon())
                  .buttonStyle(buttonStyle)
                  .build();
            })
        .toList();
  }

  private static String getLabelForMethod(Method method) {
    if (MetaAnnotations.isPresent(method, Label.class)) {
      return MetaAnnotations.find(method, Label.class).value();
    }
    return toUpperCaseFirst(method.getName());
  }
}
