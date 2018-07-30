package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Grid;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.components.grid.SortOrderProvider;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.GridDecorator;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JPAListViewComponent extends ListViewComponent {

    private final Class entityClass;

    public JPAListViewComponent(Class entityClass) {
        this.entityClass = entityClass;
    }

    @Override
    public String toString() {
        return Helper.pluralize(Helper.capitalize(entityClass.getSimpleName()));
    }

    @Override
    public Class getModelTypeForSearchFilters() {
        return entityClass;
    }

    @Override
    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException {
        return createNewInstance();
    }


    @Override
    public boolean isAddEnabled() {
        return true;
    }

    @Override
    public boolean isDeleteEnabled() {
        return true;
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();

        List<Method> ms = new ArrayList<>();

        for (Method m : ReflectionHelper.getAllMethods(entityClass)) {
            if (Modifier.isStatic(m.getModifiers()) && m.isAnnotationPresent(Action.class)) {
                ms.add(m);
            }
        }

        ms.sort((a, b) -> {
            return a.getAnnotation(Action.class).order() - b.getAnnotation(Action.class).order();
        });

        ms.forEach(m -> l.add(ViewComponentHelper.createAction(m, this)));


        return l;
    }


    public Object createNewInstance() throws IllegalAccessException, InstantiationException {
        return entityClass.newInstance();
    }


    @Override
    public Class getFiltersType() {
        return entityClass;
    }


    @Override
    public List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        List l = new ArrayList();

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, (alias) -> buildFieldsPart(alias), filters, sortOrders, offset, limit);

                    l.addAll(q.getResultList());

                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return l;
    }

    private Query buildQuery(EntityManager em, Function<Map<FieldInterfaced, String>, Object> fieldsPartBuilderFunction, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        List<FieldInterfaced> columnFields = getSelectFields(getColumnType());
        List<FieldInterfaced> filterFields = getFilterFields();

        Map<FieldInterfaced, String> alias = new HashMap<>();

        for (FieldInterfaced f : columnFields) {
            if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(NotNull.class)) {
                // referencia y no obligatorio --> left outer join

                if (!f.isAnnotationPresent(NotNull.class)) {
                    alias.put(f, "x" + alias.size());
                }
                //todo: crear joins hasta el nivel que haga falta
            }
        }

        Map<String, Object> parameterValues = new HashMap<>();
        String w = "";
        w = buildWhereClause(filters, entityClass, parameterValues);

        for (FieldInterfaced f : filterFields) { //todo: comprobar que estamos utilizando el filtro. Si no, no hace falta incluir el join
            if (f.getType().isAnnotationPresent(Entity.class) && !f.isAnnotationPresent(NotNull.class)) {
                // referencia y no obligatorio --> left outer join

                if (!f.isAnnotationPresent(NotNull.class)) {
                    if (!alias.containsKey(f.getType())) {
                        alias.put(f, "x" + alias.size());
                    }
                }

                //todo: crear joins hasta el nivel que haga falta
            }
        }

        // SELECT f from Student f LEFT JOIN f.classTbls s WHERE s.ClassName = 'abc' <=== ejemplo left outer join

        String jpql = "select " + fieldsPartBuilderFunction.apply(alias) + " from " + entityClass.getName() + " x ";

        for (FieldInterfaced c : alias.keySet()) {
            jpql += " left join x." + c.getName() + " " + alias.get(c);
        }

        if (!"".equals(w)) jpql += " where " + w;

        String oc = "";
        if (sortOrders != null) for (QuerySortOrder qso : sortOrders) {
            if (!"".equals(oc)) oc += ", ";
            oc += alias + "." + qso.getSorted() + " " + ((SortDirection.DESCENDING.equals(qso.getDirection()))?"desc":"asc");
        }
        if (!"".equals(oc)) jpql += " order by " + oc;

        Query q = em.createQuery(jpql).setFirstResult(offset).setMaxResults(limit);
        for (String k : parameterValues.keySet()) q.setParameter(k, parameterValues.get(k));
        System.out.println(jpql);
        System.out.println(q.toString());
        return q;
    }

    private List<FieldInterfaced> getSelectFields(Class targetType) {
        List<FieldInterfaced> cols = getColumnFields(targetType);

        FieldInterfaced idField = null;

        for (FieldInterfaced f : ReflectionHelper.getAllFields(targetType)) if (f.isAnnotationPresent(Id.class)) idField = f;

        cols.add(0, idField);

        return cols;
    }

    private String buildWhereClause(Object filters, Class entityClass, Map<String, Object> parameterValues) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        if (filters == null) return "";

        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(entityClass);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        //todo: contemplar caso varias anttaciones @SearchFilter para un mismo campo

        String ql = "";

        for (FieldInterfaced f : allFields) if (f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)) {

            Object v = ReflectionHelper.getValue(f, filters);

            if (v != null) {

                if (String.class.equals(v.getClass())) {

                    String s = (String) v;

                    if (!Strings.isNullOrEmpty(s)) {
                        if (!"".equals(ql)) ql += " and ";
                        ql += " lower(x." + f.getName() + ") like :" + f.getName() + " ";
                        parameterValues.put(f.getName(), "%" + ((String) v).toLowerCase() + "%");
                    }

                } else {

                    if (!"".equals(ql)) ql += " and ";
                    ql += " x." + f.getName() + " = :" + f.getName() + " ";
                    parameterValues.put(f.getName(), v);

                }

            }


        }

        return ql;
    }

    private String buildFieldsPart(Map<FieldInterfaced, String> alias) {
        String s = "";
        FieldInterfaced id = null;



        for (FieldInterfaced f : getSelectFields(getColumnType())) {

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

        if (id != null) {
            s = " x." + id.getName() + ((!"".equals(s))?", " + s:"");
        }
        return s;
    }

    @Override
    public int gatherCount(Object filters) {
        final int[] count = {0};

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, (alias) -> "count(x)", filters, null, 0, 1000);
                    System.out.println(q.toString());

                    count[0] = ((Long) q.getSingleResult()).intValue();

                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return count[0];
    }

    @Override
    public Object deserializeId(String sid) {

        FieldInterfaced idField = null;
        for (FieldInterfaced f : ReflectionHelper.getAllFields(entityClass)) {
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

    @Override
    public Class getModelType() {
        return entityClass;
    }

    @Override
    public Class getColumnType() {
        return entityClass;
    }


    @Override
    protected void delete(Set selection) {
        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    selection.forEach(o -> em.remove(em.find(entityClass, toId(o))));

                }
            });
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    @Override
    public void decorateGrid(Grid grid) {
        if (GridDecorator.class.isAssignableFrom(entityClass)) {
            try {
                ((GridDecorator)ReflectionHelper.newInstance(entityClass)).decorateGrid(grid);
            } catch (Exception e) {
                MDD.alert(e);
            }
        }
    }
}
