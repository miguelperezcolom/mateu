package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getDataType;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFormField;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getStereotype;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.Humanizer;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Image;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.*;
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
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;
import java.util.List;
import java.util.Map;
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
            .searchable(true)
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
      return false;
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

  private static String getColumnStyle(Field field) {
    if (field.isAnnotationPresent(Style.class)) {
      return field.getAnnotation(Style.class).value();
    }
    if (field.isAnnotationPresent(Image.class)) {
      return field.getAnnotation(Image.class).rowStyle();
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
    List<Pair<Tab, List<Field>>> fieldsPerTab = new ArrayList<>();
    List<Field> noTabFields = new ArrayList<>();
    var instanceType = instance instanceof Class ? (Class) instance : instance.getClass();
    arrangeInTabs(instanceType, fieldsPerTab, noTabFields, readOnly, forCreationForm);
    var content = new ArrayList<Component>();
    int maxColumns = getFormColumns(instanceType);
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
              .build());
    }
    if (fieldsPerTab.size() > 0) {
      content.add(
          TabLayout.builder()
              .id("_tabs")
              .tabs(
                  fieldsPerTab.stream()
                      .map(
                          pair ->
                              io.mateu.uidl.data.Tab.builder()
                                  .label(pair.first().value())
                                  .content(
                                      FormLayout.builder()
                                          .expandColumns(true)
                                          .maxColumns(maxColumns)
                                          .autoResponsive(true)
                                          .content(
                                              buildRows(
                                                  pair.second().stream()
                                                      .map(
                                                          field ->
                                                              (Component)
                                                                  getFormField(
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
                                          .build())
                                  .build())
                      .toList())
              .build());
    }
    return content;
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
    Tab currentTab = null;
    List<Field> currentTabFields = new ArrayList<>();
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
    for (Field field : filteredFields) {
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

  record SectionFields(String label, List<Field> fields, int columns) {}

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
        getAllEditableFields(getClass(instance)).stream()
            .filter(field -> filterField(field, forCreationForm))
            .filter(
                field ->
                    readOnly || (!readOnly && !field.isAnnotationPresent(HiddenInEditor.class)))
            .filter(
                field -> !readOnly || (readOnly && !field.isAnnotationPresent(HiddenInView.class)))
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
                                                  readOnly)))
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
                    readOnly))
        .toList();
  }

  private static Component toFormLayout(
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
    var fields =
        section.fields.stream()
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
                            section.columns))
            .toList();
    var rows = new ArrayList<Component>();
    int col = 0;
    var pendingRow = new ArrayList<Component>();
    for (Component field : fields) {
      pendingRow.add(field);
      col += (field instanceof FormField formField) ? formField.colspan() : 1;
      if (col == section.columns) {
        rows.add(FormRow.builder().content(pendingRow).build());
        pendingRow = new ArrayList<>();
        col = 0;
      }
    }
    if (!pendingRow.isEmpty()) {
      rows.add(FormRow.builder().content(pendingRow).build());
    }
    return FormLayout.builder()
        .maxColumns(section.columns())
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

  private static boolean filterField(Field field, boolean forCreationForm) {
    if (ComponentDto.class.isAssignableFrom(field.getType())) {
      return false;
    }
    if (Status.class.equals(field.getType())) {
      return false;
    }
    if (field.isAnnotationPresent(Hidden.class)) {
      return false;
    }
    if (field.isAnnotationPresent(KPI.class)) {
      return false;
    }
    if (field.isAnnotationPresent(Menu.class)) {
      return false;
    }
    if (field.isAnnotationPresent(ForeignKey.class)) {
      return true;
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && field.isAnnotationPresent(Composition.class)) {
      return false;
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
    return Humanizer.toUpperCaseFirst(method.getName());
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

  private static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return titleSupplier.title();
    }
    if (instance.getClass().isAnnotationPresent(Title.class)) {
      return instance.getClass().getAnnotation(Title.class).value();
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
    if (instance.getClass().isAnnotationPresent(MateuUI.class)
        || instance.getClass().isAnnotationPresent(Route.class)) {
      return Humanizer.toUpperCaseFirst(instance.getClass().getSimpleName());
    }
    return null;
  }
}
