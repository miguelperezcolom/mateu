package io.mateu.mdd.core.interfaces;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.JPAAdapter;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.FieldInterfacedFromField;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import io.mateu.util.persistence.JPATransaction;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public abstract class AbstractJPQLListView<R> implements RpcView<AbstractJPQLListView, R> {

    @Override
    public List<R> rpc(AbstractJPQLListView filters, List<QuerySortOrder> sortOrders, int offset, int limit) {

        List<R> l = new ArrayList<>();

        try {

            JPAHelper.notransact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, sortOrders, false);

                    q.setFirstResult(offset);
                    q.setMaxResults(limit);

                    List<FieldInterfaced> fields = getRowClass().isAnnotationPresent(Entity.class) && !getRowClass().isAnnotationPresent(NativeJPQLResult.class)?AbstractJPQLListView.getSelectFields(getRowClass()):ReflectionHelper.getAllFields(getRowClass());

                    for (FieldInterfaced f : fields) if (f instanceof FieldInterfacedFromField) f.getField().trySetAccessible();

                    for (Object o : q.getResultList()) {

                        if (o instanceof Object[]) l.add((R) ReflectionHelper.fillQueryResult(fields, (Object[]) o, getNewRowInstance()));
                        else l.add((R) o);
                    }

                }
            });
        } catch (Throwable e) {
            Notifier.alert(e);
            for (int i = 0; i < limit - offset; i++) l.add(null);
        }

        return l;
    }

    public R getNewRowInstance() throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        Class rowClass = getRowClass();
        return (R) newInstance(rowClass);
    }

    public static Object newInstance(Class c) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
        Object o = null;
        if (c.getDeclaringClass() != null) { // caso inner class
            Object p = newInstance(c.getDeclaringClass());
            Constructor<?> cons = c.getDeclaredConstructors()[0];
            cons.setAccessible(true);
            o = cons.newInstance(p);
        } else for (Constructor con : c.getDeclaredConstructors()) if (con.getParameterCount() == 0) {
            con.setAccessible(true);
            o = con.newInstance();
        }
        return o;
    }

    @Override
    public int gatherCount(AbstractJPQLListView filters) {

        int[] c = {0};

        try {

            JPAHelper.notransact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, null, true);

                    Object r = q.getSingleResult();

                    c[0] = ((Long) (r instanceof Object[]?((Object[])r)[0]:r)).intValue();

                }
            });
        } catch (Throwable e) {
            Notifier.alert(e);
        }

        return c[0];
    }

    public abstract Query buildQuery(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) throws Throwable;

    public Query buildFilteredQueryFromEntityClass(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) throws Throwable {
        List<FieldInterfaced> columnFields = getSelectFields(getRowClass());
        List<FieldInterfaced> filterFields = getFilterFields();

        Map<FieldInterfaced, String> alias = new HashMap<>();

        for (FieldInterfaced f : columnFields) {
            if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(NotNull.class)) {
                // referencia y no obligatorio --> left outer join

                if (!f.isAnnotationPresent(NotNull.class)) {
                    if (!alias.containsKey(f)) alias.put(f, "x" + alias.size());
                }
                //todo: crear joins hasta el nivel que haga falta
            }
        }

        Map<String, Object> parameterValues = new HashMap<>();
        String w = "";
        w = buildWhereClause(this, getRowClass(), parameterValues);

        for (FieldInterfaced f : filterFields) { //todo: comprobar que estamos utilizando el filtro. Si no, no hace falta incluir el join
            if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(NotNull.class)) {
                // referencia y no obligatorio --> left outer join

                if (!f.isAnnotationPresent(NotNull.class)) {
                    if (!alias.containsKey(f.getType())) {
                        if (!alias.containsKey(f)) alias.put(f, "x" + alias.size());
                    }
                }

                //todo: crear joins hasta el nivel que haga falta
            }
        }

        // SELECT f from Student f LEFT JOIN f.classTbls s WHERE s.ClassName = 'abc' <=== ejemplo left outer join

        String jpql = "select " + buildFieldsPart(alias, forCount) + " from " + getRowClass().getName() + " x ";

        for (FieldInterfaced c : alias.keySet()) {
            jpql += " left join x." + c.getName() + " " + alias.get(c);
        }

        if (!"".equals(w)) jpql += " where " + w;

        //if (!Strings.isNullOrEmpty(groupClause)) jpql += " " + groupClause + " ";

        if (!forCount) {
            String oc = "";
            if (sortOrders != null) for (QuerySortOrder qso : sortOrders) {
                if (!"".equals(oc)) oc += ", ";
                oc += "x" + "." + qso.getSorted() + " " + ((SortDirection.DESCENDING.equals(qso.getDirection()))?"desc":"asc");
            }
            List<FieldInterfaced> orderCols = new ArrayList<>();
            for (FieldInterfaced f : ReflectionHelper.getAllFields(getRowClass())) {
                if (f.isAnnotationPresent(Order.class)) orderCols.add(f);
            }
            Collections.sort(orderCols, (f1, f2) -> f1.getAnnotation(Order.class).priority() - f2.getAnnotation(Order.class).priority());
            for (FieldInterfaced f : orderCols) {
                if (!"".equals(oc)) oc += ", ";
                oc += "x" + "." + f.getName() + " " + (f.getAnnotation(Order.class).desc()?"desc":"asc");
            }
            if ("".equals(oc)) oc += "x" + "." + columnFields.get(0).getName() + " desc";
            if (!"".equals(oc)) jpql += " order by " + oc;
        }

        Query q = em.createQuery(jpql);
        for (String k : parameterValues.keySet()) q.setParameter(k, parameterValues.get(k));
        log.debug(jpql);
        log.debug(q.toString());
        return q;
    }

    private String buildFieldsPart(Map<FieldInterfaced, String> alias, boolean forCount) {
        String s = "";

        if (forCount) {
            s = "count(x)";
        } else {
            FieldInterfaced id = null;

            for (FieldInterfaced f : getSelectFields(getRowClass())) {

                if (!"".equals(s)) s += ", ";
                if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(NotNull.class)) {
                    s += "" + alias.get(f);
                    FieldInterfaced nf = ReflectionHelper.getNameField(f.getType());
                    if (nf != null) s += "." + nf.getName();
                } else {
                    s += "x." + f.getName();
                    if (f.getType().isAnnotationPresent(Entity.class)) {
                        FieldInterfaced nf = ReflectionHelper.getNameField(f.getType());
                        if (nf != null) s += "." + nf.getName();
                    }
                }

                if (f.isAnnotationPresent(Id.class)) id = f;

            }

            if (false && id != null) {
                s = " x." + id.getName() + ((!"".equals(s))?", " + s:"");
            }
        }

        return s;
    }

    public String buildWhereClause(Object filters, Class entityClass, Map<String, Object> parameterValues) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        String ql = "";

        if (filters == null) return ql;

        List<FieldInterfaced> allFields = getFilterFields();

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Version.class) || f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        //todo: contemplar caso varias anttaciones @SearchFilter para un mismo campo


        for (FieldInterfaced f : allFields) {

            String x = addFilter(filters, f, parameterValues);

            if (!Strings.isNullOrEmpty(x)) {
                if (!"".equals(ql)) ql += " and ";
                ql += x;
            }

        }

        return ql;
    }

    public List<FieldInterfaced> getFilterFields() {
        return getFilterFields(getClass());
    }

    public List<FieldInterfaced> getFilterFields(Class filtersType) {
        List<FieldInterfaced> explicitFilters = ReflectionHelper.getAllFields(filtersType).stream().filter(
                (f) -> !f.isAnnotationPresent(Version.class) && !f.isAnnotationPresent(Ignored.class) && f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)
        ).collect(Collectors.toList());
        if (explicitFilters.size() > 0) {
            return explicitFilters;
        } else {
            return ReflectionHelper.getAllFields(filtersType).stream().filter(
                    (f) ->  !f.isAnnotationPresent(Version.class) && !f.isAnnotationPresent(Ignored.class) && !f.isAnnotationPresent(Output.class) &&  !IResource.class.equals(f.getType()) && (String.class.equals(f.getType()) || LocalDate.class.equals(f.getType()) || LocalDateTime.class.equals(f.getType()) || Date.class.equals(f.getType()) || boolean.class.equals(f.getType()) || Boolean.class.equals(f.getType()) || f.getType().isEnum() || f.isAnnotationPresent(ManyToOne.class) || f.getType().isAnnotationPresent(Entity.class))
            ).collect(Collectors.toList());
        }
    }


    public static List<FieldInterfaced> getSelectFields(Class targetType) {
        List<FieldInterfaced> cols = getJPQLColumnFields(targetType);

        FieldInterfaced idField = null;

        for (FieldInterfaced f : ReflectionHelper.getAllFields(targetType)) if (f.isAnnotationPresent(Id.class)) idField = f;

        if (idField != null) cols.add(0, idField);

        return cols;
    }

    public static List<FieldInterfaced> getJPQLColumnFields(Class targetType) {
        return MDDUIAccessor.getColumnFields(targetType).stream().filter(f -> !Modifier.isTransient(f.getModifiers())).collect(Collectors.toList());
    }


    public String addFilter(Object filters, FieldInterfaced f, Map<String, Object> parameterValues) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        String ql = "";

        Object v = ReflectionHelper.getValue(f, filters);

        if (v != null) {

            if (String.class.equals(v.getClass())) {

                String s = (String) v;

                if (!Strings.isNullOrEmpty(s)) {
                    if (!"".equals(ql)) ql += " and ";
                    ql += " lower(x." + f.getName() + ") like :" + f.getName() + " ";
                    parameterValues.put(f.getName(), "%" + ((String) v).toLowerCase() + "%");
                }
            } else if (Boolean.class.equals(v.getClass()) || boolean.class.equals(v.getClass())) {

                boolean b = (Boolean) v;

                if (!"".equals(ql)) ql += " and ";

                if (!b) ql += " not ";

                ql += " x." + f.getName() + " ";

                if (b) ql += " = true ";

            } else if (LocalDate.class.equals(v.getClass()) || LocalDateTime.class.equals(v.getClass()) || Date.class.equals(v.getClass())) {

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

        return ql;
    }

    public Class    getRowClass() {
        return ReflectionHelper.getGenericClass(this.getClass(), RpcView.class, "C");
    }

    public Query getCountQueryForEclipseLink(EntityManager em, Query q) throws Exception {

        String bound = Helper.getImpl(JPAAdapter.class).extractSql(em, q);

        log.debug("bound=" + bound);

        Query qt = em.createNativeQuery("select count(*) from (" + bound + ") x");
        return qt;
    }



    public Object deserializeId(String sid) {

        FieldInterfaced idField = null;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(getRowClass())) {
            if (f.isAnnotationPresent(Id.class)) {
                idField = f;
                break;
            }
        }

        Object id = sid;
        if (idField != null) {

            if (Long.class.equals(idField.getType()) || long.class.equals(idField.getType())) id = Long.parseLong(sid);
            else if (Integer.class.equals(idField.getType()) || int.class.equals(idField.getType())) id = Integer.parseInt(sid);
            else if (Boolean.class.equals(idField.getType()) || boolean.class.equals(idField.getType())) id = Boolean.parseBoolean(sid);
            else if (Double.class.equals(idField.getType()) || double.class.equals(idField.getType())) id = Double.parseDouble(sid);

        }
        return id;
    }



}
