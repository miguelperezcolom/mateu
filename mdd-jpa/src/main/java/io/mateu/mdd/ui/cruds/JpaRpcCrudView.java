package io.mateu.mdd.ui.cruds;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.FareValue;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.SumData;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class JpaRpcCrudView implements RpcCrudView<Object, Object, Object> {

    private final MDDOpenCRUDAction action;
    private final Map<String, String> aliasedColumnNamesByColId = new HashMap<>();
    private final List<String> columnNames = new ArrayList<>();
    private final Map<String, FieldInterfaced> fieldsByColumnName = new HashMap<>();
    private final List<String> filterNames = new ArrayList<>();
    private final Map<String, FieldInterfaced> fieldsByFilterName = new HashMap<>();
    private List<String> columnFields;
    private List<FieldInterfaced> filterFields;
    private final List<String> aliasedColumnNamesList = new ArrayList<>();
    private final List<String> columnIds;
    private final Map<String, FieldInterfaced> fieldsByAliasedColumnName;
    private final Map<String, FieldInterfaced> fieldsByColId = new HashMap<>();
    private final Map<String, String> alias = new HashMap<>();
    private final Map<String, String> aliasedColumnNames = new HashMap<>();
    private final List<FieldInterfaced> sumFields;
    private List<SumData> sums;

    String selectColumnsForCount;
    String selectColumnsForList;

    public JpaRpcCrudView(MDDOpenCRUDAction action) {
        this.action = action;
        columnFields = getSelectFields(action.getEntityClass(), action.getColumns(), columnNames, fieldsByColumnName);
        filterFields = getFilterFields();
        createAliases(action.getEntityClass(), columnNames, fieldsByColumnName, alias, aliasedColumnNames, aliasedColumnNamesList);
        sumFields = fieldsByColumnName.values().stream().filter(f -> f.isAnnotationPresent(Sum.class)).collect(Collectors.toList());

        {
            String ql = "count(x)";

            for (FieldInterfaced f : sumFields) {
                if (!"".equals(ql)) ql += ", ";
                ql += " sum(x." + f.getName() + ") ";
            }

            selectColumnsForCount = ql;
        }

        selectColumnsForList = buildFieldsPart(columnFields);

        columnIds = new ArrayList<>();
        int pos = 0;
        for (String n : columnNames) {
            String colId = "col" + pos++;
            columnIds.add(colId);
            aliasedColumnNamesByColId.put(colId, aliasedColumnNames.get(n));
            if (pos > 1) fieldsByColId.put(colId, fieldsByColumnName.get(n));
        }
        fieldsByAliasedColumnName = new HashMap<>();
        columnNames.stream().forEach(n -> {
            fieldsByAliasedColumnName.put(aliasedColumnNames.get(n), fieldsByColumnName.get(n));
        });


    }

    @Override
    public List rpc(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return new JpaCrudRowsQuery(
                action,
                filters,
                null,
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
                filterFields).run();
    }

    @Override
    public int gatherCount(Object filters) throws Throwable {
        sums = new JpaCrudSumsQuery(
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
                sumFields).run();
        return new JpaCrudCountQuery(
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
                filterFields
        ).run();
    }

    @Override
    public Class getSearchFormClass() {
        return action.getEntityClass();
    }

    @Override
    public Class getRowClass() {
        return action.getEntityClass();
    }

    @Override
    public Class getEditorClass() {
        return action.getEntityClass();
    }

    @Override
    public boolean isAddEnabled() {
        return action.isCanAdd();
    }

    @Override
    public boolean isEditHandled() {
        return !action.isReadOnly();
    }

    @Override
    public boolean isDeleteEnabled() {
        return action.isCanDelete();
    }



    private void createAliases(Class sourceType, List<String> paths, Map<String, FieldInterfaced> fieldsByPath,
                               Map<String, String> alias, Map<String, String> aliasedColumnNames,
                               List<String> aliasedColumnNamesList) {
        for (String path: paths) {
            FieldInterfaced f = fieldsByPath.get(path);
            String p = path;
            FieldInterfaced fx = f;
            Class type = sourceType;
            FieldInterfaced f0 = null;
            String pathAcumulado = "x";
            while (!Strings.isNullOrEmpty(p)) {
                String s = p;
                if (p.contains(".")) {
                    p = p.substring(p.indexOf(".") + 1);
                    s = s.substring(0, s.indexOf("."));
                } else p = null;
                if (!"".equals(pathAcumulado)) pathAcumulado += ".";
                pathAcumulado += s;
                fx = ReflectionHelper.getFieldByName(type, s);
                if (fx != null) {
                    type = fx.getType();
                    if (type.isAnnotationPresent(Entity.class) && !fx.isAnnotationPresent(NotNull.class)) {
                        // referencia y no obligatorio --> left outer join
                        if (!fx.isAnnotationPresent(NotNull.class)) {
                            if (!alias.containsKey(pathAcumulado)) {
                                alias.put(pathAcumulado, "x" + alias.size());
                            }
                            pathAcumulado = alias.get(pathAcumulado);
                            f0 = fx;
                        }
                    }
                }
            }
            aliasedColumnNames.put(path, pathAcumulado);
            aliasedColumnNamesList.add(pathAcumulado);
        }

    }
    public static List<String> getSelectFields(Class targetType, String useColumns, List<String> columnNames,
                                               Map<String, FieldInterfaced> fieldsByColumnName) {
        List<FieldInterfaced> cols = getColumnFields(targetType, false, useColumns, columnNames, fieldsByColumnName);
        FieldInterfaced idField = null;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(targetType)) if (f.isAnnotationPresent(Id.class)) idField = f;
        if (idField != null) columnNames.add(0, idField.getName());

        return columnNames;
    }

    public static List<FieldInterfaced> getColumnFields(Class objectType, boolean forGrid, String fieldsFilter, List<String> columNames, Map<String, FieldInterfaced> fieldsByColumnName) {

        List<FieldInterfaced> explicitColumns = null;

        if (Strings.isNullOrEmpty(fieldsFilter)) {

            explicitColumns = ReflectionHelper.getAllFields(objectType).stream().filter(
                    f -> f.isAnnotationPresent(ListColumn.class)
            ).peek(f -> {
                if (columNames != null && fieldsByColumnName != null) {
                    String n = f.getName();
                    columNames.add(n);
                    fieldsByColumnName.put(n, f);
                }
            }).filter(f -> f != null).collect(Collectors.toList());

        } else {

            List<String> fns = Lists.newArrayList(fieldsFilter.split(","));
            fns = fns.stream().map(n -> {
                n = n.trim();
                n = n.replaceAll("\\(.*\\)", "");
                if (n.contains(" ")) n = n.substring(0, n.indexOf(" "));
                n = n.replaceAll(" ", "");
                return n;
            }).collect(Collectors.toList());

            explicitColumns = fns.stream().map(n -> {
                FieldInterfaced f = ReflectionHelper.getFieldByName(objectType, n);
                if (columNames != null && fieldsByColumnName != null) {
                    columNames.add(n);
                    fieldsByColumnName.put(n, f);
                }
                return f;
            }).filter(f -> f != null).collect(Collectors.toList());

        }

        if (explicitColumns.size() > 0) {
            return explicitColumns;
        } else {

            List<FieldInterfaced> cols = ReflectionHelper.getAllFields(objectType).stream().filter(
                    (f) -> !"_proxied".equalsIgnoreCase(f.getName()) && !"_possibleValues".equalsIgnoreCase(f.getName()) && !"_binder".equalsIgnoreCase(f.getName()) && !"_field".equalsIgnoreCase(f.getName())
                            && !Modifier.isTransient(f.getModifiers())
                            && !f.isAnnotationPresent(Transient.class)
                            && !f.isAnnotationPresent(NotInList.class)
                            && !f.isAnnotationPresent(Version.class)
                            && !f.isAnnotationPresent(Ignored.class)
                            && !f.isAnnotationPresent(Password.class)
                            //&& !Modifier.isTransient(f.getModifiers())
                            && (!Collection.class.isAssignableFrom(f.getType()) || (forGrid && f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()))
                            && !Map.class.isAssignableFrom(f.getType())
                            && !f.isAnnotationPresent(GeneratedValue.class)
                            && (ReflectionHelper.isBasico(f.getType())
                            || BigDecimal.class.equals(f.getType())
                            || f.getType().isEnum()
                            || f.getType().isAnnotationPresent(Entity.class)
                            || java.sql.Date.class.equals(f.getType())
                            || FareValue.class.equals(f.getType())
                            || Status.class.equals(f.getType())
                            || f.isAnnotationPresent(WeekDays.class)
                            || (forGrid && f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline())
                            || Runnable.class.isAssignableFrom(f.getType())
                    )
            ).filter(f -> f != null).collect(Collectors.toList());

            if (columNames != null && fieldsByColumnName != null) cols.forEach(f -> {
                columNames.add(f.getName());
                fieldsByColumnName.put(f.getName(), f);
            });

            return cols;
        }

    }

    public List<FieldInterfaced> getFilterFields() {
        return getFilterFields(action.getEntityClass());
    }

    public List<FieldInterfaced> getFilterFields(Class filtersType) {
        if (Strings.isNullOrEmpty(action.getFilters())) {

            List<FieldInterfaced> filterFields = ReflectionHelper.getAllFields(filtersType).stream().filter(
                    (f) -> !f.isAnnotationPresent(Password.class) && !f.isAnnotationPresent(Version.class)
                            && !f.isAnnotationPresent(Ignored.class)
                            && (f.isAnnotationPresent(SearchFilter.class)
                            || f.isAnnotationPresent(MainSearchFilter.class))
            ).collect(Collectors.toList());
            if (filterFields.size() == 0) {
                filterFields = ReflectionHelper.getAllFields(filtersType).stream().filter(
                        (f) ->  !f.isAnnotationPresent(Password.class) && !f.isAnnotationPresent(Version.class)
                                && !f.isAnnotationPresent(Ignored.class) && !f.isAnnotationPresent(Output.class)
                                &&  !IResource.class.isAssignableFrom(f.getType())
                                && (String.class.equals(f.getType())
                                || LocalDate.class.equals(f.getType())
                                || LocalDateTime.class.equals(f.getType())
                                || LocalTime.class.equals(f.getType())
                                || Date.class.equals(f.getType())
                                || boolean.class.equals(f.getType())
                                || Boolean.class.equals(f.getType())
                                || f.getType().isEnum()
                                || f.isAnnotationPresent(ManyToOne.class)
                                || f.getType().isAnnotationPresent(Entity.class))
                ).collect(Collectors.toList());
            }

            filterFields.forEach(f -> {
                filterNames.add(f.getName());
                fieldsByFilterName.put(f.getName(), f);
            });

            return filterFields;

        } else {

            List<String> fns = Lists.newArrayList(action.getFilters().replaceAll(" ", "").split(","));

            List<FieldInterfaced> filterFields = fns.stream().map(n -> {
                FieldInterfaced f = ReflectionHelper.getFieldByName(filtersType, n);
                if (f != null) {
                    filterNames.add(n);
                    fieldsByFilterName.put(n, f);
                }
                return f;
            }).filter(f -> f != null).collect(Collectors.toList());

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

}
