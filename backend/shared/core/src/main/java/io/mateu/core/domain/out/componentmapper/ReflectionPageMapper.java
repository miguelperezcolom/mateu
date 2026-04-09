package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.*;
import java.lang.annotation.Annotation;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.stream.Stream;
import lombok.SneakyThrows;

public class ReflectionPageMapper {

  public static Page mapToPageComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return Page.builder()
        .pageTitle(getPageTitle(instance))
        .breadcrumbs(getBreadcrumbs(instance, httpRequest))
        .title(getTitle(instance))
        .favicon(getFavicon(instance))
        .subtitle(getSubtitle(instance))
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .avatar(getAvatar(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toolbar(getToolbar(instance))
        .buttons(getButtons(instance))
        .header(getHeader(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .content(
            getContent(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest))
        .footer(getFooter(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }

  private static List<Breadcrumb> getBreadcrumbs(Object instance, HttpRequest httpRequest) {
    if (instance == null) {
      return null;
    }
    if (instance instanceof BreadcrumbsSupplier breadcrumbsSupplier) {
      return breadcrumbsSupplier.breadcrumbs(httpRequest);
    }
    if (instance.getClass().isAnnotationPresent(Breadcrumbs.class)) {
      return Arrays.stream(instance.getClass().getAnnotation(Breadcrumbs.class).value())
          .map(breadcrumb -> new Breadcrumb(breadcrumb.label(), breadcrumb.url()))
          .toList();
    }
    return null;
  }

  private static Collection<? extends Component> getFooter(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof FooterSupplier footerSupplier) {
      return footerSupplier.footer();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Footer.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  @SneakyThrows
  public static Collection<? extends Component> getContent(
      Object instanceOrType,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    Object instance;
    if (instanceOrType instanceof Class<?> type) {
      instance = MateuBeanProvider.getBean(InstanceFactory.class).newInstance(type, httpRequest);
    } else {
      instance = instanceOrType;
    }
    if (instance instanceof ContentSupplier contentSupplier) {
      return contentSupplier.content();
    }
    if (instance instanceof ListingBackend<?, ?>
        || instance instanceof ReactiveListingBackend<?, ?>) {
      return getCrud(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (isApp(instance, route)) {
      return List.of(
          mapToAppComponent(
              instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    }
    if (isForm(instance)) {
      return getForm(
          instance,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest,
          false,
          false,
          getFormColumns(instance.getClass()));
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> !Modifier.isFinal(field.getModifiers()))
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                    && !field.isAnnotationPresent(Toolbar.class)
                    && !field.isAnnotationPresent(Header.class)
                    && !field.isAnnotationPresent(Footer.class)
                    && !field.isAnnotationPresent(Avatar.class)
                    && !field.isAnnotationPresent(Menu.class)
                    && !Status.class.equals(field.getType()))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static Collection<? extends Component> getCrud(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return List.of(
        Listing.builder()
            .searchable(isSearchable(instance))
            .rowsSelectionEnabled(isRowSelectionEnabled(instance))
            .filters(
                getFilters(
                    getFiltersClass(instance),
                    instance,
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .columns(
                getColumns(
                    getRowClass(instance),
                    instance,
                    baseUrl,
                    route,
                    initiatorComponentId,
                    httpRequest))
            .style("min-width: 30rem; display: block;")
            .build());
  }

  private static boolean isRowSelectionEnabled(Object instance) {
    if (instance instanceof ListingBackend<?, ?> listingBackend) {
      return listingBackend.selectionEnabled();
    }
    if (instance instanceof ReactiveListingBackend<?, ?> reactiveListingBackend) {
      return reactiveListingBackend.selectionEnabled();
    }
    if (instance != null) {
      return getAllMethods(instance.getClass()).stream()
          .anyMatch(method -> method.isAnnotationPresent(Toolbar.class));
    }
    return false;
  }

  private static boolean isSearchable(Object instance) {
    return true;
  }

  private static Class getRowClass(Object instance) {
    if (instance instanceof ReactiveListingBackend<?, ?>) {
      getGenericClass(instance.getClass(), ReactiveListingBackend.class, "Row");
    }
    return getGenericClass(instance.getClass(), ListingBackend.class, "Row");
  }

  private static Class getFiltersClass(Object instance) {
    if (instance instanceof ReactiveListingBackend<?, ?>) {
      getGenericClass(instance.getClass(), ReactiveListingBackend.class, "Filters");
    }
    return getGenericClass(instance.getClass(), ListingBackend.class, "Filters");
  }

  public static Collection<? extends GridContent> getColumns(
      Class rowClass,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getAllFields(rowClass).stream()
        .filter(ReflectionPageMapper::filterColumn)
        .map(field -> getColumn(field, instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static boolean filterColumn(Field field) {
    if (field.isAnnotationPresent(Hidden.class)) {
      return false;
    }
    if (field.isAnnotationPresent(HiddenInList.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Menu.class)) {
      return false;
    }
    if (Collection.class.isAssignableFrom(field.getType())) {
      return false;
    }
    if (field.getType().isEnum()) {
      return true;
    }
    if (Status.class.equals(field.getType())) {
      return true;
    }
    if (Amount.class.equals(field.getType())) {
      return true;
    }
    if (!isBasic(field.getType())) {
      return true;
    }
    return true;
  }

  private static GridColumn getColumn(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return GridColumn.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataType(field))
        .stereotype(getStereotype(field))
        .style(getColumnStyle(field))
        .build();
  }

  private static String getColumnStyle(AccessibleObject field) {
    if (field.isAnnotationPresent(Style.class)) {
      return field.getAnnotation(Style.class).value();
    }
    return "";
  }

  public static Collection<FormField> getFilters(
      Class filtersClass,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getAllFields(filtersClass).stream()
        .filter(field -> false)
        .map(
            field ->
                (FormField)
                    getFormField(
                        field,
                        instance,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest,
                        false,
                        2))
        .toList();
  }

  public static Collection<? extends Component> getView(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean readOnly,
      boolean forCreationForm) {
    var instanceType = instance instanceof Class ? (Class) instance : instance.getClass();
    int maxColumns = getFormColumns(instanceType);
    return getForm(
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        maxColumns);
  }

  public static int getFormColumns(Class<?> instanceType) {
    if (instanceType.isAnnotationPresent(io.mateu.uidl.annotations.FormLayout.class)) {
      return instanceType.getAnnotation(io.mateu.uidl.annotations.FormLayout.class).columns();
    }
    return 2;
  }

  private static List<Component> buildRows(List<Component> fields, int columns) {
    var rows = new ArrayList<Component>();
    int col = 0;
    var pendingRow = new ArrayList<Component>();
    for (Component field : fields) {
      pendingRow.add(field);
      col += (field instanceof FormField formField) ? formField.colspan() : 1;
      if (col == columns) {
        rows.add(FormRow.builder().content(pendingRow).build());
        pendingRow = new ArrayList<>();
        col = 0;
      }
    }
    if (!pendingRow.isEmpty()) {
      rows.add(FormRow.builder().content(pendingRow).build());
    }
    return rows;
  }

  private static void arrangeInTabs(
      Class<?> type,
      List<Pair<Tab, List<Field>>> fieldsPerTab,
      List<Field> noTabFields,
      boolean readOnly,
      boolean forCreationForm) {
    var filteredFields =
        getAllEditableFields(type).stream()
            .filter(field -> readOnly || !field.isAnnotationPresent(Composition.class))
            .filter(field -> !Status.class.equals(field.getType()))
            .filter(field -> !field.isAnnotationPresent(KPI.class))
            .filter(
                field ->
                    !field.isAnnotationPresent(Hidden.class)
                        || !"".equals(field.getAnnotation(Hidden.class).value()))
            .toList();
    arrangeInTabs(filteredFields, fieldsPerTab, noTabFields, readOnly, forCreationForm);
  }

  private static void arrangeInTabs(
      List<Field> fields,
      List<Pair<Tab, List<Field>>> fieldsPerTab,
      List<Field> noTabFields,
      boolean readOnly,
      boolean forCreationForm) {
    Tab currentTab = null;
    List<Field> currentTabFields = new ArrayList<>();

    for (Field field : fields) {
      if (field.isAnnotationPresent(Tab.class)) {
        if (currentTab != null) {
          fieldsPerTab.add(new Pair<>(currentTab, currentTabFields));
        }
        currentTab = field.getAnnotation(Tab.class);
        currentTabFields = new ArrayList<>();
      }
      if (currentTab != null) {
        currentTabFields.add(field);
      } else {
        noTabFields.add(field);
      }
    }
    if (currentTab != null) {
      fieldsPerTab.add(new Pair<>(currentTab, currentTabFields));
    }
  }

  public static Collection<? extends Component> getForm(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns) {
    return getForm(
        "",
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        maxColumns);
  }

  public record SectionFields(String label, List<Field> fields, int columns) {}

  public record TabFields(String label, List<Field> fields, int columns) {}

  public static Collection<? extends Component> getForm(
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns) {
    Map<Section, SectionFields> fieldsPerSection = new HashMap<>();
    List<Section> sections = new ArrayList<>();
    Section sectionAnnotation = null;
    SectionFields sectionFields = null;
    for (Field field :
        getFormFields(instance).stream()
            .filter(field -> filterField(field, forCreationForm, readOnly))
            .filter(field -> readOnly || !hiddenInEditor(field, forCreationForm))
            .filter(field -> !readOnly || !hiddenInView(field))
            .toList()) {
      if (sectionFields == null || field.isAnnotationPresent(Section.class)) {
        if (sectionFields != null) {
          fieldsPerSection.put(sectionAnnotation, sectionFields);
          sections.add(sectionAnnotation);
        }
        if (field.isAnnotationPresent(Section.class)) {
          sectionAnnotation = field.getAnnotation(Section.class);
        } else {
          sectionAnnotation =
              new Section() {
                @Override
                public Class<? extends Annotation> annotationType() {
                  return null;
                }

                @Override
                public String value() {
                  return "";
                }

                @Override
                public int columns() {
                  return maxColumns;
                }

                @Override
                public String style() {
                  return "";
                }
              };
        }
        sectionFields =
            new SectionFields(getLabel(field), new ArrayList<>(), sectionAnnotation.columns());
      }
      sectionFields.fields.add(field);
    }
    if (sectionFields != null) {
      sections.add(sectionAnnotation);
      fieldsPerSection.put(sectionAnnotation, sectionFields);
    }
    if (sections.size() > 1) {
      return List.of(
          io.mateu.uidl.data.HorizontalLayout.builder()
              .spacing(true)
              .content(
                  sections.stream()
                      .map(
                          section ->
                              (Component)
                                  VerticalLayout.builder()
                                      .style(section.style())
                                      .content(
                                          List.of(
                                              Text.builder()
                                                  .text(section.value())
                                                  .container(TextContainer.h4)
                                                  .build(),
                                              toFormLayout(
                                                  fieldsPerSection.get(section),
                                                  prefix,
                                                  instance,
                                                  baseUrl,
                                                  route,
                                                  consumedRoute,
                                                  initiatorComponentId,
                                                  httpRequest,
                                                  forCreationForm,
                                                  readOnly,
                                                  section.columns())))
                                      .build())
                      .toList())
              .build());
    }
    return sections.stream()
        .map(
            section ->
                toFormLayout(
                    fieldsPerSection.get(section),
                    prefix,
                    instance,
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest,
                    forCreationForm,
                    readOnly,
                    section.columns()))
        .toList();
  }

  private static boolean hiddenInView(Field field) {
    return field.isAnnotationPresent(HiddenInView.class);
  }

  private static boolean hiddenInEditor(Field field, boolean forCreationForm) {
    if (Component.class.isAssignableFrom(field.getType())
        || Callable.class.isAssignableFrom(field.getType())) {
      return true;
    }
    if (forCreationForm) {
      return field.isAnnotationPresent(HiddenInCreate.class);
    }
    return field.isAnnotationPresent(HiddenInEditor.class);
  }

  private static Collection<Field> getFormFields(Object instance) {
    if (instance instanceof EditableFieldsProvider editableFieldsProvider) {
      return editableFieldsProvider.allEditableFields();
    }
    if (instance instanceof Class<?> type) {
      return getAllEditableFields(type);
    }
    return getAllEditableFields(getClass(instance));
  }

  public static Component toFormLayout(
      SectionFields section,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly) {
    var instanceType = instance instanceof Class ? (Class) instance : instance.getClass();
    return toFormLayout(
        section,
        prefix,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        getFormColumns(instanceType));
  }

  public static Component toFormLayout(
      SectionFields section,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns) {
    return toFormLayout(
        section,
        prefix,
        instance,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest,
        forCreationForm,
        readOnly,
        maxColumns,
        "");
  }

  public static Component toFormLayout(
      SectionFields section,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly,
      int maxColumns,
      String style) {
    List<Pair<Tab, List<Field>>> fieldsPerTab = new ArrayList<>();
    List<Field> noTabFields = new ArrayList<>();
    arrangeInTabs(section.fields(), fieldsPerTab, noTabFields, readOnly, forCreationForm);
    var content = new ArrayList<Component>();
    if (!noTabFields.isEmpty()) {

      content.add(
          FormLayout.builder()
              .expandColumns(true)
              .maxColumns(maxColumns)
              .autoResponsive(true)
              .content(
                  buildRows(
                      noTabFields.stream()
                          .map(
                              field ->
                                  (Component)
                                      getFormField(
                                          prefix,
                                          field,
                                          instance,
                                          baseUrl,
                                          route,
                                          consumedRoute,
                                          initiatorComponentId,
                                          httpRequest,
                                          readOnly,
                                          forCreationForm,
                                          maxColumns))
                          .toList(),
                      maxColumns))
              .style(style)
              .build());
    }
    if (fieldsPerTab.size() > 0) {
      content.add(
          TabLayout.builder()
              .id("_tabs")
              .style("width: 100%;" + style)
              .tabs(
                  fieldsPerTab.stream()
                      .map(
                          pair ->
                              io.mateu.uidl.data.Tab.builder()
                                  .label(getTabName(pair))
                                  .content(
                                      toFormLayout(
                                          new TabFields(
                                              pair.first().value(), pair.second(), maxColumns),
                                          prefix,
                                          instance,
                                          baseUrl,
                                          route,
                                          consumedRoute,
                                          initiatorComponentId,
                                          httpRequest,
                                          forCreationForm,
                                          readOnly))
                                  .build())
                      .toList())
              .build());
    }
    return VerticalLayout.builder().content(content).style("width: 100%;").build();
  }

  private static String getTabName(Pair<Tab, List<Field>> pair) {
    var label = pair.first().value();
    if (label == null || "".equals(label)) {
      label = toUpperCaseFirst(pair.second().get(0).getName());
    }
    return label;
  }

  private static Component toFormLayout(
      TabFields tab,
      String prefix,
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest,
      boolean forCreationForm,
      boolean readOnly) {
    var fields =
        tab.fields.stream()
            .map(
                field ->
                    (Component)
                        getFormField(
                            prefix,
                            field,
                            getInstance(instance),
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest,
                            readOnly || isReadOnly(field, instance, forCreationForm),
                            forCreationForm,
                            tab.columns))
            .toList();
    var rows = new ArrayList<Component>();
    int col = 0;
    var pendingRow = new ArrayList<Component>();
    for (Component field : fields) {
      pendingRow.add(field);
      col += (field instanceof FormField formField) ? formField.colspan() : 1;
      if (col == tab.columns) {
        rows.add(FormRow.builder().content(pendingRow).build());
        pendingRow = new ArrayList<>();
        col = 0;
      }
    }
    if (!pendingRow.isEmpty()) {
      rows.add(FormRow.builder().content(pendingRow).build());
    }
    return FormLayout.builder()
        .maxColumns(tab.columns())
        //              .columnWidth("10rem")
        //              .columnSpacing("1rem")
        .autoResponsive(true)
        .expandColumns(true)
        .content(rows)
        .build();
  }

  private static Object getInstance(Object instance) {
    if (Class.class.equals(instance.getClass())) {
      return null;
    }
    return instance;
  }

  private static Class getClass(Object instance) {
    if (Class.class.equals(instance.getClass())) {
      return (Class) instance;
    }
    return instance.getClass();
  }

  private static boolean filterField(Field field, boolean forCreationForm, boolean readOnly) {
    if (ComponentDto.class.isAssignableFrom(field.getType())) {
      return false;
    }
    if (Status.class.equals(field.getType())) {
      return false;
    }
    if (field.isAnnotationPresent(Hidden.class)
        && field.getAnnotation(Hidden.class).value().isEmpty()) {
      return false;
    }
    if (field.isAnnotationPresent(KPI.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Menu.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Lookup.class)) {
      return true;
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && field.isAnnotationPresent(Composition.class)) {
      return readOnly;
    }
    if (forCreationForm) {}
    return true;
  }

  public static boolean isReadOnly(Field field, Object instance, boolean forCreationForm) {
    return (instance != null && instance.getClass().isAnnotationPresent(ReadOnly.class))
        || field.isAnnotationPresent(ReadOnly.class)
        || field.isAnnotationPresent(GeneratedValue.class)
        || (!forCreationForm && field.isAnnotationPresent(EditableOnlyWhenCreating.class));
  }

  private static boolean isForm(Object instance) {
    if (instance instanceof Form) {
      return true;
    }
    return getAllFields(instance.getClass()).stream()
            .anyMatch(
                field ->
                    field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                        || field.isAnnotationPresent(Toolbar.class))
        || getAllMethods(instance.getClass()).stream()
            .anyMatch(
                method ->
                    method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                        || method.isAnnotationPresent(Toolbar.class));
  }

  private static Collection<? extends Component> getHeader(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof HeaderSupplier headerSupplier) {
      return headerSupplier.header();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Header.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static Collection<? extends UserTrigger> getButtons(Object instance) {
    if (instance instanceof ButtonsSupplier buttonsSupplier) {
      return buttonsSupplier.buttons();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .map(field -> getButton(field, instance)),
            getAllMethods(instance.getClass()).stream()
                .filter(
                    method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .map(method -> getButton(method, instance)))
        .toList();
  }

  private static Collection<? extends UserTrigger> getToolbar(Object instance) {
    if (instance instanceof ToolbarSupplier toolbarSupplier) {
      return toolbarSupplier.toolbar();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(Toolbar.class))
                .map(field -> getButton(field, instance)),
            getAllMethods(instance.getClass()).stream()
                .filter(method -> method.isAnnotationPresent(Toolbar.class))
                .map(method -> getButton(method, instance)))
        .toList();
  }

  private static Button getButton(Method method, Object instance) {
    return Button.builder().label(getLabel(method)).actionId(method.getName()).build();
  }

  private static Button getButton(Field field, Object instance) {
    return Button.builder().label(getLabel(field)).actionId(field.getName()).build();
  }

  private static Component getAvatar(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof AvatarSupplier avatarSupplier) {
      return avatarSupplier.avatar();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Avatar.class))
        .findAny()
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .orElse(null);
  }

  private static String getFavicon(Object instance) {
    if (instance.getClass().isAnnotationPresent(FavIcon.class)) {
      return instance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  private static String getCssClasses(Object instance) {
    if (instance.getClass().isAnnotationPresent(CssClasses.class)) {
      return instance.getClass().getAnnotation(CssClasses.class).value();
    }
    return null;
  }

  private static String getStyle(Object instance) {
    if (instance.getClass().isAnnotationPresent(Style.class)) {
      return instance.getClass().getAnnotation(Style.class).value();
    }
    return null;
  }

  private static String getLabel(Method method) {
    if (method.isAnnotationPresent(Label.class)) {
      return method.getAnnotation(Label.class).value();
    }
    return toUpperCaseFirst(method.getName());
  }

  private static String getLabel(Field field) {
    return ReflectionFormFieldMapper.getLabel(field);
  }

  private static String getSubtitle(Object instance) {
    if (instance instanceof SubtitleSupplier subtitleSupplier) {
      return subtitleSupplier.subtitle();
    }
    if (instance.getClass().isAnnotationPresent(Subtitle.class)) {
      return instance.getClass().getAnnotation(Subtitle.class).value();
    }
    return null;
  }

  @SneakyThrows
  public static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return titleSupplier.title();
    }
    if (instance.getClass().isAnnotationPresent(Title.class)) {
      return instance.getClass().getAnnotation(Title.class).value();
    }
    if (instance instanceof NamedView namedView) {
      return namedView.name();
    }
    if (instance instanceof Named named) {
      return named.name();
    }
    if (instance != null) {
      if (instance.getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
        return getPageTitle(instance);
      }
      return instance.toString();
    }
    return null;
  }

  private static String getPageTitle(Object instance) {
    if (instance instanceof PageTitleSupplier pageTitleSupplier) {
      return pageTitleSupplier.pageTitle();
    }
    if (instance.getClass().isAnnotationPresent(PageTitle.class)) {
      return instance.getClass().getAnnotation(PageTitle.class).value();
    }
    if (instance.getClass().isAnnotationPresent(UI.class)
        || instance.getClass().isAnnotationPresent(Route.class)) {
      return toUpperCaseFirst(instance.getClass().getSimpleName());
    }
    return toUpperCaseFirst(instance.getClass().getSimpleName());
  }
}
