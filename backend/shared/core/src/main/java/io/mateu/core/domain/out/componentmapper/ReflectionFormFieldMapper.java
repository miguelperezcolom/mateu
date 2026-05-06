package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.BasicTypeChecker.isBasicArray;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getForm;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getFormColumns;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Amount;
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
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import io.mateu.uidl.interfaces.OptionsSupplier;
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
import java.util.*;
import java.util.List;
import java.util.concurrent.Callable;

public class ReflectionFormFieldMapper {

  public static Component getFormField(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      int maxColumns) {
    return getFormField(
        field,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        isReadOnly(field, instance),
        forCreationForm,
        maxColumns);
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
      boolean forCreationForm,
      int maxColumns) {
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
        forCreationForm,
        maxColumns);
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
      boolean forCreationForm,
      int maxColumns) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    var fieldType = field.getType();
    if (Callable.class.isAssignableFrom(field.getType())) {
      var value = getValue(field, instance);
      fieldType = value.getClass();
    }
    if (Component.class.isAssignableFrom(fieldType)) {
      var component = (Component) getValue(field, instance);
      return CustomField.builder()
          .label(getLabel(field))
          .content(component)
          //          .content(
          //              resolveFutureComponents(
          //                  (Component) getValue(field, instance),
          //                  baseUrl,
          //                  route,
          //                  consumedRoute,
          //                  initiatorComponentId,
          //                  httpRequest))
          .colspan(getColspan(field))
          .style(component.style())
          .build();
    }
    if (List.class.isAssignableFrom(fieldType) && field.isAnnotationPresent(Composition.class)) {
      return createCrudForCompositionField(field, httpRequest, instance);
    }
    if (field.isAnnotationPresent(Composition.class)) {
      return createEditorForCompositionField(field, httpRequest, instance);
    }
    if (List.class.isAssignableFrom(fieldType)
        && !field.isAnnotationPresent(Lookup.class)
        && !field.isAnnotationPresent(Composition.class)
        && !isBasic(getGenericClass(field, List.class, "E"))) {
      return createCrudForField(
          field,
          prefix,
          readOnly || ReflectionPageMapper.isReadOnly(field, instance, forCreationForm),
          httpRequest);
    }
    if (!isBasic(fieldType)
        && !fieldType.isEnum()
        && !List.class.isAssignableFrom(fieldType)
        && !Map.class.isAssignableFrom(fieldType)
        && !Amount.class.equals(fieldType)
        && !Status.class.equals(fieldType)
        && !isBasicArray(fieldType)) {
      if (instance instanceof ModelSupplier modelSupplier) {
        instance = modelSupplier.model();
      }
      var value = instance instanceof Class ? null : getValue(field, instance);
      return CustomField.builder()
          .label(getLabelForNonBasic(field))
          .content(
              getForm(
                      ("".equals(prefix) ? "" : (prefix + "-")) + field.getName() + "-",
                      value != null ? value : fieldType,
                      baseUrl,
                      route,
                      consumedRoute,
                      initiatorComponentId,
                      httpRequest,
                      forCreationForm,
                      readOnly || ReflectionPageMapper.isReadOnly(field, instance, forCreationForm),
                      maxColumns)
                  .stream()
                  .findFirst()
                  .orElse(null))
          .colspan(maxColumns)
          .style("width: 100%;")
          .build();
    }
    if (field.isAnnotationPresent(Text.class)) {
      var colspan = getColspan(field);
      var attributes = new HashMap<String, String>();
      if (colspan > 1) {
        attributes.put("data-colspan", "" + colspan);
      }
      return io.mateu.uidl.data.Text.builder()
          .id(getFieldId(field, prefix, readOnly))
          .container(field.getAnnotation(Text.class).container())
          .text("${state." + prefix + field.getName() + "}")
          .attributes(attributes)
          .build();
    }
    return FormField.builder()
        .id(getFieldId(field, prefix, readOnly))
        .label(getLabel(field))
        .dataType(getDataType(field))
        .style(getStyle(field))
        .stereotype(getStereotype(field))
        .required(isRequired(field))
        .sliderMin(getSliderMin(field))
        .sliderMax(getSliderMax(field))
        .remoteCoordinates(getRemoteCoordinates(prefix, field))
        .readOnly(readOnly || ReflectionPageMapper.isReadOnly(field, instance, forCreationForm))
        .options(getOptions(field, instance, httpRequest))
        .colspan(getColspan(field))
        .description(getDescription(field))
        .attributes(getAttributes(field))
        .optionsColumns(getOptionsColumns(field))
        .build();
  }

  private static String getLabelForNonBasic(Field field) {
    if (Runnable.class.isAssignableFrom(field.getType())) {
      return "";
    }
    return getLabel(field);
  }

  private static Map<String, String> getAttributes(Field field) {
    if (field.isAnnotationPresent(DivStyle.class)) {
      return Map.of("divStyle", field.getAnnotation(DivStyle.class).value());
    }
    return Map.of();
  }

  private static String getDescription(Field field) {
    if (field.isAnnotationPresent(Help.class)) {
      return field.getAnnotation(Help.class).value();
    }
    return "";
  }

  private static String getStyle(Field field) {
    if (field.isAnnotationPresent(Style.class)) {
      return field.getAnnotation(Style.class).value();
    }
    return "";
  }

  private static Component createEditorForCompositionField(
      Field field, HttpRequest httpRequest, Object instance) {
    var composition = field.getAnnotation(Composition.class);
    /*
    var crud =
        new DynamicEditor(
            composition.targetClass(),
            composition.repositoryClass(),
            composition.foreignKeyField(),
            ((Entity<?>) instance).id(),
            getLabel(field),
            true);
    return new CustomField("", crud, "width: 100%;", "", 2);
     */
    return new io.mateu.uidl.data.Text(field.getName(), "Pending");
  }

  private static Component createCrudForCompositionField(
      Field field, HttpRequest httpRequest, Object instance) {
    var composition = field.getAnnotation(Composition.class);
    /*
    var crud =
        new DynamicCrudOrchestrator(
            composition.targetClass(),
            composition.repositoryClass(),
            composition.foreignKeyField(),
            ((Entity<?>) instance).id(),
            getLabel(field),
            true);
    return new CustomField("", crud, "width: 100%;", "", 2);
     */
    return new io.mateu.uidl.data.Text(field.getName(), "Pending");
  }

  private static int getColspan(Field field) {
    if (field.isAnnotationPresent(Colspan.class)) {
      return field.getAnnotation(Colspan.class).value();
    }
    return 1;
  }

  private static Component createCrudForField(
      Field field, String prefix, boolean readOnly, HttpRequest httpRequest) {
    var columns = new ArrayList<GridContent>();
    getAllFields(getGenericClass(field, field.getType(), "E")).stream()
        .filter(
            columnField ->
                (!columnField.isAnnotationPresent(Hidden.class)
                        || !columnField.getAnnotation(Hidden.class).value().isEmpty())
                    && !columnField.isAnnotationPresent(HiddenInList.class)
                    && !List.class.isAssignableFrom(columnField.getType())
            //                    && (isBasic(columnField.getType())
            //                        || columnField.getType().isEnum()
            //                        || ColumnAction.class.equals(columnField.getType())
            //                        || ColumnActionGroup.class.equals(columnField.getType()))
            )
        .forEach(
            columnField -> {
              columns.add(
                  GridColumn.builder()
                      .dataType(getDataTypeForColumn(columnField))
                      .stereotype(getStereotypeForColumn(columnField))
                      .id(columnField.getName())
                      .label(getLabel(columnField))
                      .width(getColumnWidth(columnField))
                      .filterable(getFilterable(columnField))
                      .build());
            });
    if (!readOnly) {
      columns.add(
          GridColumn.builder()
              .dataType(FieldDataType.string)
              .stereotype(FieldStereotype.button)
              .id("_select")
              .label("")
              .text("Edit")
              .actionId(getFieldId(field, prefix, readOnly) + "_select")
              .width("3rem")
              .build());
    }
    String detailPath = getDetailPath(field);
    return FormField.builder()
        .id(getFieldId(field, prefix, readOnly))
        .dataType(FieldDataType.array)
        .stereotype(FieldStereotype.grid)
        .readOnly(readOnly)
        .detailPath(detailPath)
        .useButtonForDetail(detailPath != null)
        .label(getLabel(field))
        .columns(columns)
        .style(getStyleForArray(field))
        .colspan(getColspan(field))
        .itemIdPath("_rowNumber")
        .onItemSelectionActionId(
            readOnly ? null : getFieldId(field, prefix, readOnly) + "_selected")
        .formPosition(getFormPosition(field))
        .formStyle(getFormStyle(field))
        .formTheme(getFormTheme(field))
        .formColumns(getDetailFormColumns(field))
        .readOnly(readOnly)
        .minHeightWhenDetailVisible(getMinHeightWhenDetailVisible(field))
        .optionsColumns(getOptionsColumns(field))
        .build();
  }

  private static int getOptionsColumns(Field field) {
    if (field.isAnnotationPresent(OptionsLayout.class)) {
      return field.getAnnotation(OptionsLayout.class).columns();
    }
    return 1;
  }

  private static boolean getFilterable(Field columnField) {
    return columnField.isAnnotationPresent(Filterable.class);
  }

  private static String getMinHeightWhenDetailVisible(Field field) {
    if (field.isAnnotationPresent(MasterDetail.class)) {
      return field.getAnnotation(MasterDetail.class).minHeightWhenDetailVisible();
    }
    return "16rem;";
  }

  private static String getDetailPath(Field field) {
    return getAllFields(getGenericClass(field, field.getType(), "E")).stream()
        .filter(columnField -> columnField.isAnnotationPresent(Details.class))
        .map(Field::getName)
        .findFirst()
        .orElse(null);
  }

  public static int getDetailFormColumns(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      var columns = field.getAnnotation(DetailFormCustomisation.class).columns();
      if (columns != 2) {
        return columns;
      }
    }
    return getFormColumns(getGenericClass(field, field.getType(), "E"));
  }

  private static String getFormTheme(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      return field.getAnnotation(DetailFormCustomisation.class).theme();
    }
    return null;
  }

  private static String getFormStyle(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      return field.getAnnotation(DetailFormCustomisation.class).style();
    }
    return null;
  }

  private static FormPosition getFormPosition(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      return field.getAnnotation(DetailFormCustomisation.class).position();
    }
    return FormPosition.right;
  }

  private static String getColumnWidth(Field columnField) {
    if (columnField.isAnnotationPresent(ColumnWidth.class)) {
      return columnField.getAnnotation(ColumnWidth.class).value();
    }
    return null;
  }

  public static FieldDataType getDataTypeForColumn(Field columnField) {
    if (ColumnAction.class.equals(columnField.getType())) {
      return FieldDataType.action;
    }
    if (ColumnActionGroup.class.equals(columnField.getType())) {
      return FieldDataType.actionGroup;
    }
    if (Status.class.equals(columnField.getType())) {
      return FieldDataType.status;
    }
    if (columnField.isAnnotationPresent(io.mateu.uidl.annotations.Status.class)) {
      return FieldDataType.status;
    }
    if (columnField.isAnnotationPresent(MappedValue.class)) {
      return FieldDataType.string;
    }
    if (ComponentDto.class.isAssignableFrom(columnField.getType())) {
      return FieldDataType.component;
    }
    if (ColumnAction.class.isAssignableFrom(columnField.getType())) {
      return FieldDataType.action;
    }
    if (boolean.class.equals(columnField.getType())
        || Boolean.class.equals(columnField.getType())) {
      return FieldDataType.bool;
    }
    return FieldDataType.string;
  }

  public static FieldStereotype getStereotypeForColumn(Field columnField) {
    if (columnField.isAnnotationPresent(Stereotype.class)) {
      return columnField.getAnnotation(Stereotype.class).value();
    }
    return FieldStereotype.regular;
  }

  private static String getStyleForArray(Field field) {
    var style = getStyle(field);
    if (style != null && !style.isEmpty()) {
      return style;
    }
    return "min-width: 10rem; width: 100%;";
  }

  public static String getFieldId(Field field, String prefix, boolean readOnly) {
    if (readOnly && field.isAnnotationPresent(Lookup.class)) {
      return prefix + field.getName() + "-label";
    }
    return prefix + field.getName();
  }

  private static List<Option> getOptions(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof OptionsSupplier optionsSupplier) {
      return optionsSupplier.options(field.getName(), httpRequest);
    }
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
    if (field.isAnnotationPresent(Lookup.class)) {
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
    if (field.isAnnotationPresent(Stereotype.class)) {
      return field.getAnnotation(Stereotype.class).value();
    }
    if (field.getType().isEnum()) {
      return FieldStereotype.select;
    }
    if (field.isAnnotationPresent(Lookup.class)) {
      return FieldStereotype.combobox;
    }
    if (field.isAnnotationPresent(Representation.class)) {
      return field.getAnnotation(Representation.class).value();
    }
    if (field.isAnnotationPresent(SliderMin.class) || field.isAnnotationPresent(SliderMax.class)) {
      return FieldStereotype.slider;
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
