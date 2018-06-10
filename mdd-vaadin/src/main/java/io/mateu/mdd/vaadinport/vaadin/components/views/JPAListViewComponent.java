package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.google.common.base.Strings;
import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Grid;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.components.grid.SortOrderProvider;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

import javax.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JPAListViewComponent extends ListViewComponent {

    private final Class entityClass;

    public JPAListViewComponent(Class entityClass) {
        this.entityClass = entityClass;

        setViewTitle(Helper.pluralize(Helper.capitalize(entityClass.getSimpleName())));
    }


    public Class getEntityClass() {
        return entityClass;
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
    public void addViewActionsMenuItems(MenuBar bar) {
        super.addViewActionsMenuItems(bar);

        bar.addItem("New", VaadinIcons.PLUS, new MenuBar.Command() {
            @Override
            public void menuSelected(MenuBar.MenuItem menuItem) {
                try {
                    MDD.openEditor(getOriginatingAction(), entityClass, null, false);
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });

    }


    public Object createNewInstance() throws IllegalAccessException, InstantiationException {
        return entityClass.newInstance();
    }


    private List<FieldInterfaced> getColumnFields() {
        return ReflectionHelper.getAllFields(entityClass).stream().filter((f) -> !f.isAnnotationPresent(Transient.class) && !f.isAnnotationPresent(Ignored.class) && !Modifier.isTransient(f.getModifiers())).collect(Collectors.toList());
    }

    @Override
    public void buildColumns(Grid grid) {
        int pos = 0;
        for (FieldInterfaced f : getColumnFields()) {
            int finalPos = 1 + pos++;
             grid.addColumn(new ValueProvider() {
                @Override
                public Object apply(Object o) {
                    //return ReflectionHelper.getValue(f, o);
                    return ((Object[]) o)[finalPos];
                }
            }).setCaption(Helper.capitalize(f.getName())).setWidth(150).setSortOrderProvider(new SortOrderProvider() {
                 @Override
                 public Stream<QuerySortOrder> apply(SortDirection sortDirection) {
                     return Stream.of(new QuerySortOrder(f.getName(), sortDirection));
                 }
             }).setId(f.getName());
        }


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

    private Query buildQuery(EntityManager em, Function<String, String> fieldsPartBuilderFunction, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        String alias = "x";

        String jpql = "select " + fieldsPartBuilderFunction.apply(alias) + " from " + entityClass.getName() + " x ";

        Map<String, Object> parameterValues = new HashMap<>();
        String w = "";
        w = buildWhereClause(filters, entityClass, parameterValues);
        if (!"".equals(w)) jpql += " where " + w;


        String oc = "";
        if (sortOrders != null) for (QuerySortOrder qso : sortOrders) {
            if (!"".equals(oc)) oc += ", ";
            oc += alias + "." + qso.getSorted() + " " + ((SortDirection.DESCENDING.equals(qso.getDirection()))?"desc":"asc");
        }
        if (!"".equals(oc)) jpql += " order by " + oc;

        Query q = em.createQuery(jpql).setFirstResult(offset).setMaxResults(limit);
        for (String k : parameterValues.keySet()) q.setParameter(k, parameterValues.get(k));
        System.out.println(q.toString());
        return q;
    }

    private String buildWhereClause(Object filters, Class entityClass, Map<String, Object> parameterValues) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        if (filters == null) return "";

        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(entityClass);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        //todo: contemplar caso varias anttaciones @SearchFilter para un mismo campo

        String ql = "";

        for (FieldInterfaced f : allFields) if (f.isAnnotationPresent(SearchFilter.class)) {

            Object v = ReflectionHelper.getValue(f, filters);

            if (v != null) {

                if (String.class.equals(v.getClass())) {

                    String s = (String) v;

                    if (!Strings.isNullOrEmpty(s)) {
                        if (!"".equals(ql)) ql += " and ";
                        ql += " lower(x." + f.getName() + ") like :" + f.getName() + " ";
                        parameterValues.put(f.getName(), "%" + ((String) v).toLowerCase() + "%");
                    }

                }

            }


        }

        return ql;
    }

    @Override
    public int gatherCount(Object filters) {
        final int[] count = {0};

        try {
            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, (alias) -> "count(" + alias + ")", filters, null, 0, 1000);
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
    public String getPathForEditor(Object id) {
        return ((MyUI) MyUI.getCurrent()).getPath(getOriginatingAction(), entityClass, id);
    }

    private String buildFieldsPart(String alias) {
        String s = "";
        FieldInterfaced id = null;
        for (FieldInterfaced f : getColumnFields()) {

                if (!"".equals(s)) s += ", ";
                s += "" + alias + "." + f.getName();

                if (f.isAnnotationPresent(Id.class)) id = f;

        }

        if (id != null) {
            s = alias + "." + id.getName() + ((!"".equals(s))?", " + s:"");
        }
        return s;
    }
}
