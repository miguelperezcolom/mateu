package io.mateu.mdd.ui.cruds;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.interfaces.AuditRecord;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j@AllArgsConstructor
public abstract class JpaCrudQuery {

    protected MDDOpenCRUDAction action;
    protected Object filters;
    protected List<QuerySortOrder> sortOrders;
    private int offset;
    private int limit;
    protected Map<String, String> aliasedColumnNamesByColId;
    private String queryFilters;
    private ExtraFilters extraFilters;
    protected String selectColumnsForCount;
    protected String selectColumnsForList;
    private Map<String, String> alias;
    private Map<String, String> aliasedColumnNames;
    private List<String> columnNames;
    protected List<String> aliasedColumnNamesList;
    private List<FieldInterfaced> filterFields;

    protected Query buildQuery(EntityManager em, String selectedColumns, Object filters, List<QuerySortOrder> sortOrders,
                               String groupClause, int offset, int limit, boolean addOrderClause)
            throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {


        Map<String, Object> parameterValues = new HashMap<>();
        String w = "";
        w = buildWhereClause(filters, action.getEntityClass(), parameterValues);

        // SELECT f from Student f LEFT JOIN f.classTbls s WHERE s.ClassName = 'abc' <=== ejemplo left outer join

        String jpql = "select " + selectedColumns + " from " + action.getEntityClass().getName() + " x ";

        for (String c : alias.keySet()) {
            jpql += " left join " + c + " " + alias.get(c);
        }

        if (!"".equals(w)) jpql += " where " + w;

        if (!Strings.isNullOrEmpty(groupClause)) jpql += " " + groupClause + " ";

        if (addOrderClause) {
            String oc = "";
            if (sortOrders != null) for (QuerySortOrder qso : sortOrders) {
                if (!"".equals(oc)) oc += ", ";
                oc += "col" + getColumnIndex(aliasedColumnNamesByColId.entrySet().stream()
                        .filter(e -> e.getValue().equals(qso.getSorted()))
                        .map(e -> e.getKey())
                        .findFirst()
                        .get()) + " " + ((SortDirection.DESCENDING.equals(qso.getDirection()))?"desc":"asc");
            }
            List<FieldInterfaced> orderCols = new ArrayList<>();
            for (FieldInterfaced f : ReflectionHelper.getAllFields(action.getEntityClass())) {
                if (f.isAnnotationPresent(Order.class)) orderCols.add(f);
            }
            Collections.sort(orderCols, (f1, f2) -> f1.getAnnotation(Order.class).priority() - f2.getAnnotation(Order.class).priority());
            for (FieldInterfaced f : orderCols) {
                if (!"".equals(oc)) oc += ", ";
                oc += aliasedColumnNames.get(f.getName()) + " " + (f.getAnnotation(Order.class).desc()?"desc":"asc");
            }
            if ("".equals(oc) && ReflectionHelper.getFieldByName(action.getEntityClass(), "audit") != null
                    && AuditRecord.class.isAssignableFrom(
                    ReflectionHelper.getFieldByName(action.getEntityClass(), "audit").getType()))
                oc += "x" + ".audit.modified desc";
            if ("".equals(oc) && columnNames.size() > 1) oc += aliasedColumnNames.get(columnNames.get(1)) + " desc";
            if (!"".equals(oc)) jpql += " order by " + oc;
        }

        Query q = em.createQuery(jpql).setFirstResult(offset).setMaxResults(limit);
        for (String k : parameterValues.keySet()) q.setParameter(k, parameterValues.get(k));
        log.info(jpql);
        return q;
    }

    private String buildWhereClause(Object filters, Class entityClass, Map<String, Object> parameterValues)
            throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        String ql = "";

        try {
            updateExtraFilters();
        } catch (Exception e) {
            Notifier.alert(e);
        }

        if (!Strings.isNullOrEmpty(queryFilters)) {

            if (!"".equals(ql)) ql += " and ";

            ql += queryFilters;

        }

        if (extraFilters != null && !Strings.isNullOrEmpty(extraFilters.getQl())) {

            if (!"".equals(ql)) ql += " and ";

            ql += extraFilters.getQl();

            if (extraFilters.getParameters() != null) parameterValues.putAll(extraFilters.getParameters());

        }

        if (filters == null) return ql;

        List<FieldInterfaced> allFields = filterFields;

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Version.class) || f.isAnnotationPresent(Ignored.class)
                        || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)
                        && !f.isAnnotationPresent(MainSearchFilter.class)
                        && !f.isAnnotationPresent(SearchFilter.class)))
        ).collect(Collectors.toList());

        //todo: contemplar caso varias anotaciones @SearchFilter para un mismo campo


        for (FieldInterfaced f : allFields) {

            Object v = ReflectionHelper.getValue(f, filters);

            if (v != null) {

                FieldInterfaced ef = ReflectionHelper.getFieldByName(entityClass, f.getName());

                if (ef != null && ef.getType().isAnnotationPresent(UseIdToSelect.class)) {

                    boolean anadir = !String.class.equals(v.getClass()) || !Strings.isNullOrEmpty((String) v);

                    if (anadir) {
                        FieldInterfaced idf = ReflectionHelper.getIdField(entityClass);

                        if (!"".equals(ql)) ql += " and ";
                        ql += " x." + f.getName() + "." + idf.getName() + " = :" + f.getName() + " ";
                        parameterValues.put(f.getName(), v);
                    }

                } else if (String.class.equals(v.getClass())) {

                    String s = (String) v;

                    if (!Strings.isNullOrEmpty(s)) {
                        if (!"".equals(ql)) ql += " and ";
                        ql += " lower(x." + f.getName() + (f.isAnnotationPresent(LiteralSearchFilter.class)?".es":"")
                                + ") like :" + f.getName() + " ";
                        parameterValues.put(f.getName(), "%" + ((String) v).toLowerCase() + "%");
                    }
                } else if (Boolean.class.equals(v.getClass()) || boolean.class.equals(v.getClass())) {

                    boolean b = (Boolean) v;

                    if (!"".equals(ql)) ql += " and ";

                    if (!b) ql += " not ";

                    ql += " x." + f.getName() + " ";

                    if (b) ql += " = true ";

                } else if (Integer.class.equals(v.getClass()) || int.class.equals(v.getClass())
                        || Long.class.equals(v.getClass()) || long.class.equals(v.getClass())
                        || Double.class.equals(v.getClass()) || double.class.equals(v.getClass())) {

                    String fname = f.getName();
                    if (fname.endsWith("From")) fname = fname.substring(0, fname.lastIndexOf("From"));
                    if (fname.endsWith("To")) fname = fname.substring(0, fname.lastIndexOf("To"));
                    if (fname.endsWith("Value")) fname = fname.substring(0, fname.lastIndexOf("Value"));

                    if (!"".equals(ql)) ql += " and ";
                    ql += " x." + fname + " " +
                            (f.getName().endsWith("From")?">=":(f.getName().endsWith("To")?"<=":"="))
                            + " :" + f.getName() + " ";
                    parameterValues.put(f.getName(), v);

                } else if (LocalDate.class.equals(v.getClass()) || LocalDateTime.class.equals(v.getClass())
                        || Date.class.equals(v.getClass())) {

                    String fname = f.getName();
                    if (fname.endsWith("From")) fname = fname.substring(0, fname.lastIndexOf("From"));
                    if (fname.endsWith("To")) fname = fname.substring(0, fname.lastIndexOf("To"));

                    if (!"".equals(ql)) ql += " and ";
                    ql += " x." + fname + " " + ((f.getName().endsWith("From"))?">=":"<=") + " :" + f.getName() + " ";
                    parameterValues.put(f.getName(), v);

                } else {

                    if (!"".equals(ql)) ql += " and ";
                    ql += " x." + f.getName() + " = :" + f.getName() + " ";
                    parameterValues.put(f.getName(), v);

                }

            }


        }

        return ql;
    }

    public void updateExtraFilters() throws Exception {
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

    private int getColumnIndex(String columnId) {
        int i = aliasedColumnNamesList.indexOf(columnId);
        if (i < 0 && columnId.startsWith("col")) i = Integer.parseInt(columnId.substring("col".length()));
        return i;
    }


}
