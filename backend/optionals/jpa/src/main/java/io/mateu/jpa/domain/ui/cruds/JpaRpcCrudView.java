package io.mateu.jpa.domain.ui.cruds;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFromType;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasActions;
import io.mateu.core.domain.uidefinition.core.interfaces.RpcCrudViewExtended;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.SumData;
import io.mateu.core.domain.uidefinition.shared.interfaces.IResource;
import io.mateu.dtos.SortCriteria;
import io.mateu.jpa.domain.ui.cruds.commands.DeleteRowsCommand;
import io.mateu.jpa.domain.ui.cruds.commands.DeleteRowsCommandHandler;
import io.mateu.jpa.domain.ui.cruds.queries.count.CountQuery;
import io.mateu.jpa.domain.ui.cruds.queries.count.CountQueryHandler;
import io.mateu.jpa.domain.ui.cruds.queries.findById.FindByIdQuery;
import io.mateu.jpa.domain.ui.cruds.queries.findById.FindByIdQueryHandler;
import io.mateu.jpa.domain.ui.cruds.queries.rows.RowsQuery;
import io.mateu.jpa.domain.ui.cruds.queries.rows.RowsQueryHandler;
import io.mateu.jpa.domain.ui.cruds.queries.sums.SumsQuery;
import io.mateu.jpa.domain.ui.cruds.queries.sums.SumsQueryHandler;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Getter
@Setter
@Component
@Scope("prototype")
@Primary
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
// @JsonSerialize(using = JpaRpcCrudViewSerializer.class)
// @JsonDeserialize(using = JpaRpcCrudViewDeserializer.class)
public class JpaRpcCrudView implements Crud<Object, Object>, RpcCrudViewExtended, HasActions {

  private MDDOpenCRUDAction action;
  @JsonIgnore private Map<String, String> aliasedColumnNamesByColId = new HashMap<>();
  @JsonIgnore private List<String> columnNames = new ArrayList<>();
  @JsonIgnore private Map<String, Field> fieldsByColumnName = new HashMap<>();
  @JsonIgnore private List<String> filterNames = new ArrayList<>();
  @JsonIgnore private Map<String, Field> fieldsByFilterName = new HashMap<>();
  @JsonIgnore private List<String> columnFieldNames = new ArrayList<>();
  @JsonIgnore private List<String> visibleColumns = new ArrayList<>();
  @JsonIgnore private List<Field> filterFields = new ArrayList<>();
  @JsonIgnore private List<String> aliasedColumnNamesList = new ArrayList<>();
  @JsonIgnore private List<String> columnIds = new ArrayList<>();
  @JsonIgnore private Map<String, Field> fieldsByAliasedColumnName = new HashMap<>();
  @JsonIgnore private Map<String, Field> fieldsByColId = new HashMap<>();
  @JsonIgnore private Map<String, String> alias = new HashMap<>();
  @JsonIgnore private Map<String, String> aliasedColumnNames = new HashMap<>();
  @JsonIgnore private List<Field> sumFields = new ArrayList<>();
  @JsonIgnore private List<Field> columnFields = new ArrayList<>();
  @JsonIgnore private List<SumData> sums = new ArrayList<>();

  @JsonIgnore String selectColumnsForCount;
  @JsonIgnore String selectColumnsForList;

  @JsonIgnore @Autowired CountQueryHandler countQueryHandler;
  @JsonIgnore @Autowired RowsQueryHandler rowsQueryHandler;
  @JsonIgnore @Autowired SumsQueryHandler sumsQueryHandler;
  @JsonIgnore @Autowired FindByIdQueryHandler findByIdQueryHandler;
  @JsonIgnore @Autowired ReflectionHelper reflectionHelper;
  @JsonIgnore @Autowired Humanizer humanizer;

  public JpaRpcCrudView() {}

  public JpaRpcCrudView(MDDOpenCRUDAction action)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    this.action = action;
  }

  public void init()
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    reset();
    columnFields =
        getColumnFields(
            action.getEntityClass(), false, action.getColumns(), columnNames, fieldsByColumnName);
    columnFieldNames =
        getSelectFields(
            action.getEntityClass(), action.getColumns(), columnNames, fieldsByColumnName);
    visibleColumns =
        Strings.isNullOrEmpty(action.getColumns())
            ? null
            : Arrays.stream(action.getColumns().split(",")).toList();
    if (visibleColumns == null || visibleColumns.size() == 0) {
      visibleColumns = columnFieldNames.stream().skip(1).collect(Collectors.toList());
    }
    filterFields = getFilterFields();
    createAliases(
        action.getEntityClass(),
        columnNames,
        fieldsByColumnName,
        alias,
        aliasedColumnNames,
        aliasedColumnNamesList);
    sumFields =
        fieldsByColumnName.values().stream()
            .filter(Objects::nonNull)
            .filter(f -> f.isAnnotationPresent(Sum.class))
            .collect(Collectors.toList());

    StringBuilder ql = new StringBuilder("count(x)");
    for (Field f : sumFields) {
      if (!ql.isEmpty()) ql.append(", ");
      ql.append(" sum(x." + f.getName() + ") ");
    }
    selectColumnsForCount = ql.toString();

    selectColumnsForList = buildFieldsPart(columnFieldNames);

    columnIds = new ArrayList<>();
    int pos = 0;
    for (String n : columnNames) {
      String colId = "col" + pos++;
      columnIds.add(colId);
      aliasedColumnNamesByColId.put(colId, aliasedColumnNames.get(n));
      if (pos > 1) fieldsByColId.put(colId, fieldsByColumnName.get(n));
    }
    fieldsByAliasedColumnName = new HashMap<>();
    columnNames.stream()
        .forEach(
            n -> {
              fieldsByAliasedColumnName.put(aliasedColumnNames.get(n), fieldsByColumnName.get(n));
            });
  }

  private void reset() {
    aliasedColumnNamesByColId = new HashMap<>();
    columnNames = new ArrayList<>();
    fieldsByColumnName = new HashMap<>();
    filterNames = new ArrayList<>();
    fieldsByFilterName = new HashMap<>();
    columnFieldNames = new ArrayList<>();
    visibleColumns = new ArrayList<>();
    filterFields = new ArrayList<>();
    aliasedColumnNamesList = new ArrayList<>();
    columnIds = new ArrayList<>();
    fieldsByAliasedColumnName = new HashMap<>();
    fieldsByColId = new HashMap<>();
    alias = new HashMap<>();
    aliasedColumnNames = new HashMap<>();
    sumFields = new ArrayList<>();
    columnFields = new ArrayList<>();
    sums = new ArrayList<>();
  }

  public void setAction(MDDOpenCRUDAction action)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    this.action = action;
    init();
  }

  @Override
  public Flux fetchRows(Object filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable {
    return rowsQueryHandler.run(
        new RowsQuery(
            action,
            filters,
            sortOrders,
            offset,
            limit,
            aliasedColumnNamesByColId,
            action.getQueryFilters(),
            action.getExtraFilters(),
            selectColumnsForCount,
            selectColumnsForList,
            alias,
            aliasedColumnNames,
            aliasedColumnNamesList,
            columnNames,
            filterFields,
            columnFields));
  }

  @Override
  public Mono<Long> fetchCount(Object filters) throws Throwable {
    sums =
        sumFields.isEmpty()
            ? List.of()
            : sumsQueryHandler.run(
                new SumsQuery(
                    action,
                    filters,
                    null,
                    0,
                    0,
                    aliasedColumnNamesByColId,
                    action.getQueryFilters(),
                    action.getExtraFilters(),
                    selectColumnsForCount,
                    selectColumnsForList,
                    alias,
                    aliasedColumnNames,
                    aliasedColumnNamesList,
                    columnNames,
                    filterFields,
                    sumFields,
                    columnFields));
    return countQueryHandler.run(
        new CountQuery(
            action,
            filters,
            null,
            0,
            0,
            aliasedColumnNamesByColId,
            action.getQueryFilters(),
            action.getExtraFilters(),
            selectColumnsForCount,
            selectColumnsForList,
            alias,
            aliasedColumnNames,
            aliasedColumnNamesList,
            columnNames,
            filterFields,
            columnFields));
  }

  @JsonIgnore
  @Override
  public Class getSearchFormClass() {
    return action.getEntityClass();
  }

  @JsonIgnore
  @Override
  public Class getRowClass() {
    return HashMap.class;
  }

  @JsonIgnore
  @Override
  public Object getRow(Map<String, Object> row, Serializer serializer) throws Throwable {
    Object id = row.get("col0");
    return findByIdQueryHandler.run(
        FindByIdQuery.builder().entityClass(getEntityClass()).id(id).build());
  }

  @JsonIgnore
  public boolean isAddEnabled() {
    return action.isCanAdd();
  }

  @JsonIgnore
  public boolean isEditHandled() {
    return !action.isReadOnly();
  }

  @JsonIgnore
  @Override
  public Map<Field, String> getColumnIdsPerField() {
    Map<Field, String> map = new HashMap<>();
    fieldsByColId.entrySet().stream()
        .filter(f -> !map.containsKey(f.getValue()))
        .forEach(e -> map.put(e.getValue(), e.getKey()));
    return map;
  }

  @JsonIgnore
  @Override
  public Map<Field, String> getColumnCaptionsPerField() {
    return columnNames.stream()
        .filter(n -> n.contains("."))
        .map(n -> new Pair(n, fieldsByColumnName.get(n)))
        .map(p -> new Pair(humanizer.capitalize((String) p.getKey()), p.getValue()))
        .collect(Collectors.toMap(p -> (Field) p.getValue(), p -> (String) p.getKey()));
  }

  @JsonIgnore
  public boolean isDeleteEnabled() {
    return action.isCanDelete();
  }

  @Override
  public void delete(List<Object> selection) throws Throwable {
    reflectionHelper
        .newInstance(DeleteRowsCommandHandler.class)
        .run(
            DeleteRowsCommand.builder()
                .rows(selection)
                .entityClass(action.getEntityClass())
                .build());
  }

  private void createAliases(
      Class sourceType,
      List<String> paths,
      Map<String, Field> fieldsByPath,
      Map<String, String> alias,
      Map<String, String> aliasedColumnNames,
      List<String> aliasedColumnNamesList) {
    for (String path : paths) {
      Field f = fieldsByPath.get(path);
      String p = path;
      Field fx = f;
      Class type = sourceType;
      Field f0 = null;
      String pathAcumulado = "x";
      while (!Strings.isNullOrEmpty(p)) {
        String s = p;
        if (p.contains(".")) {
          p = p.substring(p.indexOf(".") + 1);
          s = s.substring(0, s.indexOf("."));
        } else p = null;
        if (!"".equals(pathAcumulado)) pathAcumulado += ".";
        pathAcumulado += s;
        fx = reflectionHelper.getFieldByName(type, s);
        if (fx != null) {
          type = fx.getType();
          if (type.isAnnotationPresent(Entity.class) && !fx.isAnnotationPresent(NotNull.class)) {
            // referencia y no obligatorio --> left outer join
            if (!alias.containsKey(pathAcumulado)) {
              alias.put(pathAcumulado, "x" + alias.size());
            }
            pathAcumulado = alias.get(pathAcumulado);
            f0 = fx;
          }
        }
      }
      aliasedColumnNames.put(path, pathAcumulado);
      aliasedColumnNamesList.add(pathAcumulado);
    }
  }

  @JsonIgnore
  public List<String> getSelectFields(
      Class targetType,
      String useColumns,
      List<String> columnNames,
      Map<String, Field> fieldsByColumnName) {
    Field idField = null;
    for (Field f : reflectionHelper.getAllFields(targetType)) {
      if (f.isAnnotationPresent(Id.class)) idField = f;
    }
    if (idField != null) columnNames.add(0, idField.getName());

    return columnNames;
  }

  @JsonIgnore
  public List<Field> getColumnFields(
      Class objectType,
      boolean forGrid,
      String fieldsFilter,
      List<String> columNames,
      Map<String, Field> fieldsByColumnName) {

    List<Field> explicitColumns = null;

    if (Strings.isNullOrEmpty(fieldsFilter)) {

      explicitColumns =
          reflectionHelper.getAllFields(objectType).stream()
              .filter(
                  f ->
                      !f.isAnnotationPresent(OneToMany.class)
                          && !f.isAnnotationPresent(ManyToMany.class))
              .peek(
                  f -> {
                    if (columNames != null && fieldsByColumnName != null) {
                      String n = f.getName();
                      columNames.add(n);
                      fieldsByColumnName.put(n, f);
                    }
                  })
              .filter(f -> f != null)
              .collect(Collectors.toList());

    } else {

      List<String> fns = Lists.newArrayList(fieldsFilter.split(","));
      fns =
          fns.stream()
              .map(
                  n -> {
                    n = n.trim();
                    n = n.replaceAll("\\(.*\\)", "");
                    if (n.contains(" ")) n = n.substring(0, n.indexOf(" "));
                    n = n.replaceAll(" ", "");
                    return n;
                  })
              .collect(Collectors.toList());

      explicitColumns =
          fns.stream()
              .map(
                  n -> {
                    Field f = reflectionHelper.getFieldByName(objectType, n);
                    if (columNames != null && fieldsByColumnName != null) {
                      columNames.add(n);
                      fieldsByColumnName.put(n, f);
                    }
                    return f;
                  })
              .filter(f -> f != null)
              .collect(Collectors.toList());
    }

    if (explicitColumns.size() > 0) {
      return explicitColumns;
    } else {

      List<Field> cols =
          reflectionHelper.getAllFields(objectType).stream()
              .filter(
                  (f) ->
                      !"_proxied".equalsIgnoreCase(f.getName())
                          && !"_possibleValues".equalsIgnoreCase(f.getName())
                          && !"_binder".equalsIgnoreCase(f.getName())
                          && !"_field".equalsIgnoreCase(f.getName())
                          && !Modifier.isTransient(f.getModifiers())
                          && !f.isAnnotationPresent(Transient.class)
                          && !f.isAnnotationPresent(NotInList.class)
                          && !f.isAnnotationPresent(Version.class)
                          && !f.isAnnotationPresent(Ignored.class)
                          && !f.isAnnotationPresent(Password.class)
                          && !f.getType().isArray()
                          && !List.class.isAssignableFrom(f.getType())
                          // && !Modifier.isTransient(f.getModifiers())
                          && (!Collection.class.isAssignableFrom(f.getType())
                              || (forGrid
                                  && f.isAnnotationPresent(UseCheckboxes.class)
                                  && f.getAnnotation(UseCheckboxes.class).editableInline()))
                          && !Map.class.isAssignableFrom(f.getType())
                          && !f.isAnnotationPresent(GeneratedValue.class)
                          && (reflectionHelper.isBasic(f.getType())
                              || BigDecimal.class.equals(f.getType())
                              || f.getType().isEnum()
                              || f.getType().isAnnotationPresent(Entity.class)
                              || java.sql.Date.class.equals(f.getType())
                              || Status.class.equals(f.getType())
                              || f.isAnnotationPresent(WeekDays.class)
                              || (forGrid
                                  && f.isAnnotationPresent(UseCheckboxes.class)
                                  && f.getAnnotation(UseCheckboxes.class).editableInline())
                              || Runnable.class.isAssignableFrom(f.getType())))
              .filter(f -> f != null)
              .collect(Collectors.toList());

      if (columNames != null && fieldsByColumnName != null)
        cols.forEach(
            f -> {
              columNames.add(f.getName());
              fieldsByColumnName.put(f.getName(), f);
            });

      return cols;
    }
  }

  @JsonIgnore
  @Override
  public List<Field> getFilterFields() {
    return getFilterFields(action.getEntityClass());
  }

  @JsonIgnore
  @Override
  public Class getEntityClass() {
    return action.getEntityClass();
  }

  @JsonIgnore
  public List<Field> getFilterFields(Class filtersType) {
    if (Strings.isNullOrEmpty(action.getFilters())) {

      List<Field> filterFields =
          reflectionHelper.getAllFields(filtersType).stream()
              .filter(
                  (f) ->
                      !f.isAnnotationPresent(Password.class)
                          && !f.isAnnotationPresent(Version.class)
                          && !f.isAnnotationPresent(Ignored.class)
                          && (f.isAnnotationPresent(SearchFilter.class)
                              || f.isAnnotationPresent(MainSearchFilter.class)))
              .collect(Collectors.toList());
      if (filterFields.size() == 0) {
        filterFields =
            reflectionHelper.getAllFields(filtersType).stream()
                .filter(
                    (f) ->
                        !f.isAnnotationPresent(Password.class)
                            && !f.isAnnotationPresent(Version.class)
                            && !f.isAnnotationPresent(Ignored.class)
                            && !f.isAnnotationPresent(ReadOnly.class)
                            && !IResource.class.isAssignableFrom(f.getType())
                            && (String.class.equals(f.getType())
                                || LocalDate.class.equals(f.getType())
                                || LocalDateTime.class.equals(f.getType())
                                || LocalTime.class.equals(f.getType())
                                || Date.class.equals(f.getType())
                                || boolean.class.equals(f.getType())
                                || Boolean.class.equals(f.getType())
                                || f.getType().isEnum()
                                || f.isAnnotationPresent(ManyToOne.class)
                                || f.getType().isAnnotationPresent(Entity.class)))
                .collect(Collectors.toList());
      }

      var searchTextField = new FieldFromType(String.class, "_search-text", reflectionHelper);
      filterFields.add(0, searchTextField);

      filterFields.forEach(
          f -> {
            filterNames.add(f.getName());
            fieldsByFilterName.put(f.getName(), f);
          });

      return filterFields;

    } else {

      List<String> fns = Lists.newArrayList(action.getFilters().replaceAll(" ", "").split(","));

      List<Field> filterFields =
          fns.stream()
              .map(
                  n -> {
                    Field f = reflectionHelper.getFieldByName(filtersType, n);
                    if (f != null) {
                      filterNames.add(n);
                      fieldsByFilterName.put(n, f);
                    }
                    return f;
                  })
              .filter(f -> f != null)
              .collect(Collectors.toList());

      var searchTextField = new FieldFromType(String.class, "_search-text", reflectionHelper);
      filterFields.add(0, searchTextField);

      filterFields.forEach(
          f -> {
            filterNames.add(f.getName());
            fieldsByFilterName.put(f.getName(), f);
          });

      return filterFields;
    }
  }

  private String buildFieldsPart(List<String> columnFieldNames) {
    String s = "";
    int pos = 0;
    for (String columnName : columnFieldNames) {
      if (!"".equals(s)) s += ", ";

      String colId = aliasedColumnNames.get(columnName);
      s += colId + " as col" + pos++;
    }
    return s;
  }

  @JsonIgnore
  public List<Field> getColumnFieldNames() {
    return visibleColumns.stream()
        .map(fn -> fieldsByColumnName.get(fn))
        .collect(Collectors.toList());
  }

  @JsonIgnore
  public String getCaptionFromAction() {
    return action.getCaption();
  }

  public Object getDetail(Object id) throws Throwable {
    return reflectionHelper
        .newInstance(FindByIdQueryHandler.class)
        .run(FindByIdQuery.builder().id(getId(id)).entityClass(action.getEntityClass()).build());
  }

  private Object getId(Object row) {
    if (row instanceof Map) {
      return ((Map) row).get("col0");
    }
    return reflectionHelper.getId(row);
  }

  @JsonIgnore
  public Object getNewRecordForm() throws Throwable {
    Set<Class> subclasses = reflectionHelper.getSubclasses(getEntityClass());
    if (subclasses.size() > 1) {
      return new ChooseEntityClassForm(subclasses);
    }
    return reflectionHelper.newInstance(getEntityClass());
  }

  @JsonIgnore
  @Override
  public List<Method> getActionMethods() {
    return reflectionHelper.getAllMethods(getEntityClass()).stream()
        .filter(m -> m.isAnnotationPresent(Action.class))
        .filter(m -> Modifier.isStatic(m.getModifiers()))
        .collect(Collectors.toList());
  }

  @Override
  public String toString() {
    return action != null ? action.getCaption() : getClass().getSimpleName();
  }
}
