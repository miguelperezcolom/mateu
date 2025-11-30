package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.domain.Humanizer;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Representation;
import io.mateu.uidl.annotations.SliderMax;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FutureComponent;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Range;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.reflection.ComponentMapper;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.io.File;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.List;

public class ReflectionFormFieldMapper {

  public static Component getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (Component.class.isAssignableFrom(field.getType())) {
      return CustomField.builder()
          .label(getLabel(field))
          .content((Component) getValue(field, instance))
          //          .content(
          //              resolveFutureComponents(
          //                  (Component) getValue(field, instance),
          //                  baseUrl,
          //                  route,
          //                  consumedRoute,
          //                  initiatorComponentId,
          //                  httpRequest))
          .build();
    }
    return FormField.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataType(field))
        .stereotype(getStereotype(field))
        .required(isRequired(field))
        .sliderMin(getSliderMin(field))
        .sliderMax(getSliderMax(field))
        .readOnly(isReadOnly(field, instance))
        .build();
  }

  private static Component resolveFutureComponents(
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof FutureComponent futureComponent) {
      ComponentMapper componentMapper = MateuBeanProvider.getBean(ComponentMapper.class);
      var resolvedComponents =
          componentMapper.mapToComponents(
              futureComponent.instance(),
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest);
      if (resolvedComponents.size() == 1) {
        return resolvedComponents.iterator().next();
      }
      return new VerticalLayout((List<Component>) resolvedComponents.stream().toList());
    }
    if (component instanceof VerticalLayout verticalLayout) {
      return new VerticalLayout(
          verticalLayout.content().stream()
              .map(
                  child ->
                      resolveFutureComponents(
                          child, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest))
              .toList());
    }
    if (component instanceof HorizontalLayout horizontalLayout) {
      return new HorizontalLayout(
          horizontalLayout.content().stream()
              .map(
                  child ->
                      resolveFutureComponents(
                          child, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest))
              .toList());
    }
    // todo: hacer con todas las layouts
    return component;
  }

  private static boolean isReadOnly(Field field, Object instance) {
    return instance.getClass().isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(ReadOnly.class);
  }

  private static int getSliderMax(Field field) {
    if (field.isAnnotationPresent(SliderMax.class)) {
      return field.getAnnotation(SliderMax.class).value();
    }
    return 100;
  }

  private static int getSliderMin(Field field) {
    if (field.isAnnotationPresent(SliderMin.class)) {
      return field.getAnnotation(SliderMin.class).value();
    }
    return 0;
  }

  private static boolean isRequired(Field field) {
    return field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class);
  }

  public static FieldStereotype getStereotype(Field field) {
    if (field.isAnnotationPresent(Representation.class)) {
      return field.getAnnotation(Representation.class).value();
    }
    return FieldStereotype.regular;
  }

  public static String getLabel(Field field) {
    if (field.isAnnotationPresent(Label.class)) {
      return field.getAnnotation(Label.class).value();
    }
    return Humanizer.toUpperCaseFirst(field.getName());
  }

  public static FieldDataType getDataType(Field field) {
    /*
    money
           */
    if (String.class.equals(field.getType())) {
      return FieldDataType.string;
    }
    if (boolean.class.equals(field.getType()) || Boolean.class.equals(field.getType())) {
      return FieldDataType.bool;
    }
    if (int.class.equals(field.getType())
        || Integer.class.equals(field.getType())
        || long.class.equals(field.getType())
        || Long.class.equals(field.getType())
        || BigInteger.class.equals(field.getType())) {
      return FieldDataType.integer;
    }
    if (float.class.equals(field.getType())
        || Float.class.equals(field.getType())
        || double.class.equals(field.getType())
        || Double.class.equals(field.getType())
        || BigDecimal.class.equals(field.getType())) {
      return FieldDataType.number;
    }
    if (LocalDate.class.equals(field.getType())) {
      return FieldDataType.date;
    }
    if (LocalDateTime.class.equals(field.getType())
        || Date.class.equals(field.getType())
        || ZonedDateTime.class.equals(field.getType())
        || java.sql.Date.class.equals(field.getType())) {
      return FieldDataType.dateTime;
    }
    if (LocalTime.class.equals(field.getType())) {
      return FieldDataType.time;
    }
    if (field.getType().isArray() || Collection.class.isAssignableFrom(field.getType())) {
      return FieldDataType.array;
    }
    if (File.class.isAssignableFrom(field.getType())) {
      return FieldDataType.file;
    }
    if (Status.class.isAssignableFrom(field.getType())) {
      return FieldDataType.status;
    }
    if (ComponentDto.class.isAssignableFrom(field.getType())) {
      return FieldDataType.component;
    }
    if (Component.class.isAssignableFrom(field.getType())) {
      return FieldDataType.component;
    }
    if (Menu.class.isAssignableFrom(field.getType())) {
      return FieldDataType.menu;
    }
    if (Range.class.isAssignableFrom(field.getType())) {
      return FieldDataType.range;
    }
    if (ColumnActionGroup.class.isAssignableFrom(field.getType())) {
      return FieldDataType.actionGroup;
    }
    if (ColumnAction.class.isAssignableFrom(field.getType())) {
      return FieldDataType.action;
    }
    return FieldDataType.string;
  }
}
