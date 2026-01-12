package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getForm;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.DynamicCrud;
import io.mateu.core.infra.declarative.DynamicEditor;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Representation;
import io.mateu.uidl.annotations.SliderMax;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormPosition;
import io.mateu.uidl.data.FutureComponent;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Range;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.reflection.ComponentMapper;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.io.File;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class ReflectionFormFieldMapper {

  public static Component getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm) {
    return getFormField(
        field,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        isReadOnly(field, instance),
        forCreationForm);
  }

  public static Component getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
    return getFormField(
        "",
        field,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        readOnly,
        forCreationForm);
  }

  public static Component getFormField(
      String prefix,
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
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
          .colspan(getColspan(field))
          .build();
    }
    if (List.class.isAssignableFrom(field.getType())
        && field.isAnnotationPresent(Composition.class)) {
      return createCrudForCompositionField(field, httpRequest, instance);
    }
    if (field.isAnnotationPresent(Composition.class)) {
      return createEditorForCompositionField(field, httpRequest, instance);
    }
    if (List.class.isAssignableFrom(field.getType())
        && !field.isAnnotationPresent(ForeignKey.class)
        && !field.isAnnotationPresent(Composition.class)
        && !isBasic(field.getType())) {
      return createCrudForField(field, readOnly, httpRequest);
    }
    if (!isBasic(field.getType())
        && !List.class.isAssignableFrom(field.getType())
        && !Map.class.isAssignableFrom(field.getType())
        && !Amount.class.equals(field.getType())
        && !Status.class.equals(field.getType())) {
      var value = instance instanceof Class ? null : getValue(field, instance);
      return CustomField.builder()
          .label(getLabel(field))
          .content(
              getForm(
                      ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-",
                      value != null ? value : field.getType(),
                      baseUrl,
                      route,
                      consumedRoute,
                      initiatorComponentId,
                      httpRequest,
                      forCreationForm,
                      readOnly || ReflectionPageMapper.isReadOnly(field, instance, forCreationForm))
                  .iterator()
                  .next())
          .colspan(getColspan(field))
          .build();
    }
    return FormField.builder()
        .id(getFieldId(field, prefix, readOnly))
        .label(getLabel(field))
        .dataType(getDataType(field))
        .stereotype(getStereotype(field))
        .required(isRequired(field))
        .sliderMin(getSliderMin(field))
        .sliderMax(getSliderMax(field))
        .remoteCoordinates(getRemoteCoordinates(prefix, field))
        .readOnly(readOnly || ReflectionPageMapper.isReadOnly(field, instance, forCreationForm))
        .options(getOptions(field))
        .colspan(getColspan(field))
        .build();
  }

  private static Component createEditorForCompositionField(
      Field field, HttpRequest httpRequest, Object instance) {
    var composition = field.getAnnotation(Composition.class);
    var crud =
        new DynamicEditor(
            composition.targetClass(),
            composition.repositoryClass(),
            composition.foreignKeyField(),
            ((Entity<?>) instance).id(),
            getLabel(field),
            true);
    return new CustomField("", crud, "", "", 2);
  }

  private static Component createCrudForCompositionField(
      Field field, HttpRequest httpRequest, Object instance) {
    var composition = field.getAnnotation(Composition.class);
    var crud =
        new DynamicCrud(
            composition.targetClass(),
            composition.repositoryClass(),
            composition.foreignKeyField(),
            ((Entity<?>) instance).id(),
            getLabel(field),
            true);
    return new CustomField("", crud, "", "", 2);
  }

  private static int getColspan(Field field) {
    if (field.isAnnotationPresent(Colspan.class)) {
      return field.getAnnotation(Colspan.class).value();
    }
    return 1;
  }

  private static Component createCrudForField(
      Field field, boolean readOnly, HttpRequest httpRequest) {
    var columns = new ArrayList<GridContent>();
    /*
    List.of(
                    GridColumn.builder()
                            .dataType(FieldDataType.string)
                            .id("productName")
                            .label("Product")
                            .build(),
                    GridColumn.builder()
                            .dataType(FieldDataType.string)
                            .stereotype(FieldStereotype.link)
                            .id("productId")
                            .label("Product Number")
                            .actionId("view-product")
                            .build(),
                    GridColumn.builder()
                            .dataType(FieldDataType.string)
                            .stereotype(FieldStereotype.image)
                            .id("image")
                            .label("Image")
                            .build(),
                    GridColumn.builder()
                            .dataType(FieldDataType.money)
                            .id("listPrice")
                            .label("List Price")
                            .build(),
                    GridColumn.builder()
                            .dataType(FieldDataType.number)
                            .id("quantity")
                            .label("Quantity")
                            .build(),
                    GridColumn.builder()
                            .dataType(FieldDataType.money)
                            .id("amount")
                            .label("Amount")
                            .build()
     */
    getAllFields(getGenericClass(field, field.getType(), "E"))
        .forEach(
            columnField -> {
              columns.add(
                  GridColumn.builder()
                      .dataType(FieldDataType.string)
                      .id(columnField.getName())
                      .label(getLabel(columnField))
                      .build());
            });
    return FormField.builder()
        .id(field.getName())
        .dataType(FieldDataType.array)
        .stereotype(FieldStereotype.grid)
        .readOnly(readOnly)
        .label(getLabel(field))
        .columns(columns)
        .style("min-width: 10rem; width: 100%;")
        .colspan(getColspan(field))
        .itemIdPath("_rowNumber")
        .onItemSelectionActionId(field.getName() + "_selected")
        .formPosition(FormPosition.right)
        .createForm(
            Form.builder()
                .title("New " + getLabel(field))
                .content(
                    getForm(
                            field.getName() + "-",
                            getGenericClass(field, field.getType(), "E"),
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest,
                            true,
                            readOnly)
                        .stream()
                        .toList())
                .buttons(
                    List.of(
                        Button.builder()
                            .label("Cancel")
                            .actionId(field.getName() + "_cancel")
                            .build(),
                        Button.builder()
                            .label("Save")
                            .actionId(field.getName() + "_create")
                            .build()))
                .build())
        .editor(
            Form.builder()
                .title("Update " + getLabel(field))
                .content(
                    getForm(
                            field.getName() + "-",
                            getGenericClass(field, field.getType(), "E"),
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest,
                            false,
                            readOnly)
                        .stream()
                        .toList())
                .buttons(
                    List.of(
                        Button.builder()
                            .label("Cancel")
                            .actionId(field.getName() + "_cancel")
                            .build(),
                        Button.builder().label("Save").actionId(field.getName() + "_save").build()))
                .build())
        .build();
  }

  private static String getFieldId(Field field, String prefix, boolean readOnly) {
    if (readOnly && field.isAnnotationPresent(ForeignKey.class)) {
      return prefix + field.getName() + "-label";
    }
    return prefix + field.getName();
  }

  private static List<Option> getOptions(Field field) {
    List<Option> options = new ArrayList<>();
    if (field.getType().isEnum()) {
      for (Object enumConstant : field.getType().getEnumConstants()) {
        try {
          Field enumField = field.getType().getField(enumConstant.toString());
          Label label = enumField.getAnnotation(Label.class);

          String labelValue = label != null ? label.value() : enumConstant.toString();

          options.add(new Option(enumConstant.toString(), labelValue));

        } catch (NoSuchFieldException e) {
          throw new RuntimeException(e);
        }
      }
    }
    return options;
  }

  private static RemoteCoordinates getRemoteCoordinates(String prefix, Field field) {
    if (field.isAnnotationPresent(ForeignKey.class)) {
      return RemoteCoordinates.builder().action("search-" + prefix + field.getName()).build();
    }
    return null;
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
        || field.isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(GeneratedValue.class);
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
    if (field.getType().isEnum()) {
      return FieldStereotype.select;
    }
    if (field.isAnnotationPresent(ForeignKey.class)) {
      return FieldStereotype.combobox;
    }
    if (field.isAnnotationPresent(Representation.class)) {
      return field.getAnnotation(Representation.class).value();
    }
    if (Amount.class.equals(field.getType())) {
      return FieldStereotype.money;
    }
    return FieldStereotype.regular;
  }

  public static String getLabel(AnnotatedElement fieldOrMethod) {
    if (fieldOrMethod.isAnnotationPresent(Label.class)) {
      return fieldOrMethod.getAnnotation(Label.class).value();
    }
    if (fieldOrMethod instanceof Field field) {
      return toUpperCaseFirst(field.getName());
    }
    if (fieldOrMethod instanceof Method method) {
      return toUpperCaseFirst(method.getName());
    }
    return "Not a field nor a method";
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
    if (field.getType().isEnum()) {
      return FieldDataType.string;
    }
    if (File.class.isAssignableFrom(field.getType())) {
      return FieldDataType.file;
    }
    if (Amount.class.isAssignableFrom(field.getType())) {
      return FieldDataType.money;
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
