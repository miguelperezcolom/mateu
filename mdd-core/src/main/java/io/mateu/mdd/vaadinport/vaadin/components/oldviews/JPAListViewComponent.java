package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Grid;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.ChartData;
import io.mateu.mdd.core.data.ChartValue;
import io.mateu.mdd.core.data.SumData;
import io.mateu.mdd.core.interfaces.GridDecorator;
import io.mateu.mdd.core.interfaces.StyledEnum;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.multilanguage.Literal;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
public class JPAListViewComponent extends ListViewComponent {

    private final Map<String,Object> initialValues;
    private ExtraFilters extraFilters;

    private final Class entityClass;

    private Object filters;

    private List<SumData> sums;

    public JPAListViewComponent(Class entityClass) {
        this(entityClass, null, null);
    }

    public JPAListViewComponent(Class entityClass, ExtraFilters extraFilters) {
        this(entityClass, extraFilters, null);
    }

    public JPAListViewComponent(Class entityClass, ExtraFilters extraFilters, Map<String, Object> initialValues) {
        this.entityClass = entityClass;
        this.extraFilters = extraFilters;
        this.initialValues = initialValues;

        addListener(new ListViewComponentListener() {
            @Override
            public void onEdit(Object id) {
                MDDUI.get().getNavegador().go("" + id);
            }

            @Override
            public void onSelect(Object id) {

            }
        });
    }


    @Override
    public String toString() {
        return Helper.pluralize(Helper.capitalize(entityClass.getSimpleName()));
    }


    @Override
    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        return createNewInstance();
    }

    @Override
    public void setModelForSearchFilters(Object filters) {
        if (filtersComponent != null) filtersComponent.getBinder().setBean(filters);
        this.filters = filters;
    }


    @Override
    public boolean isAddEnabled() {
        return !entityClass.isAnnotationPresent(NewNotAllowed.class);
    }

    @Override
    public boolean isDeleteEnabled() {
        return !entityClass.isAnnotationPresent(Indelible.class);
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


    public Object createNewInstance() throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        if (filters == null) {
            /*
            if (Modifier.isAbstract(entityClass.getModifiers())) {
                for (Class s : ReflectionHelper.getSubclasses(entityClass)) {
                    if (!Modifier.isAbstract(s.getModifiers())) {
                        filters = s.newInstance();
                        break;
                    };
                }
            } else {
                filters = entityClass.newInstance();
            }
            for (FieldInterfaced f : getFilterFields()) {
                try {
                    ReflectionHelper.setValue(f, filters, null);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }
            */
            filters = getFiltersType().newInstance();
            if (initialValues != null) {
                for (String k : initialValues.keySet()) {
                    try {
                        ReflectionHelper.setValue(k, filters, initialValues.get(k));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
            }
        }
        return filters;
    }

    @Override
    public Class getFiltersType() {
        try {
            return ReflectionHelper.createClass(entityClass.getName() + "000Filters", getFilterFields(entityClass), true);
        } catch (Exception e) {
            MDD.alert(e);
        }
        return null;
    }

    public Object getFilters() {
        return filters;
    }

    @Override
    public Collection findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        List l = new ArrayList();

        try {
            Helper.notransact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, (alias) -> buildFieldsPart(alias), getFilters(), sortOrders, null, offset, limit, true);

                    l.addAll(q.getResultList());

                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return l;
    }

    private Query buildQuery(EntityManager em, Function<Map<FieldInterfaced, String>, Object> fieldsPartBuilderFunction, Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        return buildQuery(em, fieldsPartBuilderFunction, filters, sortOrders, null, offset, limit, false);
    }

    private Query buildQuery(EntityManager em, Function<Map<FieldInterfaced, String>, Object> fieldsPartBuilderFunction, Object filters, List<QuerySortOrder> sortOrders, String groupClause, int offset, int limit, boolean addOrderClause) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        List<FieldInterfaced> columnFields = getSelectFields(getColumnType());
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
        w = buildWhereClause(filters, entityClass, parameterValues);

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

        String jpql = "select " + fieldsPartBuilderFunction.apply(alias) + " from " + entityClass.getName() + " x ";

        for (FieldInterfaced c : alias.keySet()) {
            jpql += " left join x." + c.getName() + " " + alias.get(c);
        }

        if (!"".equals(w)) jpql += " where " + w;

        if (!Strings.isNullOrEmpty(groupClause)) jpql += " " + groupClause + " ";

        if (addOrderClause) {
            String oc = "";
            if (sortOrders != null) for (QuerySortOrder qso : sortOrders) {
                if (!"".equals(oc)) oc += ", ";
                oc += "x" + "." + qso.getSorted() + " " + ((SortDirection.DESCENDING.equals(qso.getDirection()))?"desc":"asc");
            }
            List<FieldInterfaced> orderCols = new ArrayList<>();
            for (FieldInterfaced f : ReflectionHelper.getAllFields(getColumnType())) {
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

        Query q = em.createQuery(jpql).setFirstResult(offset).setMaxResults(limit);
        for (String k : parameterValues.keySet()) q.setParameter(k, parameterValues.get(k));
        log.debug(jpql);
        log.debug(q.toString());
        return q;
    }

    public static List<FieldInterfaced> getSelectFields(Class targetType) {
        List<FieldInterfaced> cols = getColumnFields(targetType);

        FieldInterfaced idField = null;

        for (FieldInterfaced f : ReflectionHelper.getAllFields(targetType)) if (f.isAnnotationPresent(Id.class)) idField = f;

        if (idField != null) cols.add(0, idField);

        return cols;
    }




    private String buildWhereClause(Object filters, Class entityClass, Map<String, Object> parameterValues) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        String ql = "";

        try {
            updateExtraFilters();
        } catch (Exception e) {
            MDD.alert(e);
        }

        if (extraFilters != null && !Strings.isNullOrEmpty(extraFilters.getQl())) {

            if (!"".equals(ql)) ql += " and ";

            ql += extraFilters.getQl();

            if (extraFilters.getParameters() != null) parameterValues.putAll(extraFilters.getParameters());

        }

        if (filters == null) return ql;

        List<FieldInterfaced> allFields = getFilterFields();

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Version.class) || f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class) && !f.isAnnotationPresent(MainSearchFilter.class) && !f.isAnnotationPresent(SearchFilter.class)))
        ).collect(Collectors.toList());

        //todo: contemplar caso varias anotaciones @SearchFilter para un mismo campo


        for (FieldInterfaced f : allFields) {

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

                } else if (Integer.class.equals(v.getClass()) || int.class.equals(v.getClass())
                || Long.class.equals(v.getClass()) || long.class.equals(v.getClass())
                || Double.class.equals(v.getClass()) || double.class.equals(v.getClass())) {

                    String fname = f.getName();
                    if (fname.endsWith("From")) fname = fname.substring(0, fname.lastIndexOf("From"));
                    if (fname.endsWith("To")) fname = fname.substring(0, fname.lastIndexOf("To"));
                    if (fname.endsWith("Value")) fname = fname.substring(0, fname.lastIndexOf("Value"));

                    if (!"".equals(ql)) ql += " and ";
                    ql += " x." + fname + " " + (f.getName().endsWith("From")?">=":(f.getName().endsWith("To")?"<=":"=")) + " :" + f.getName() + " ";
                    parameterValues.put(f.getName(), v);

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


        }

        return ql;
    }

    public void updateExtraFilters() throws Exception {
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

                if (false && f.isAnnotationPresent(Id.class)) id = f;

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
            Helper.notransact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    sums = new ArrayList<>();

                    List<FieldInterfaced> sumFields = ReflectionHelper.getAllFields(entityClass).stream().filter(f -> f.isAnnotationPresent(Sum.class)).collect(Collectors.toList());

                    Query q = buildQuery(em, (alias) -> {
                        String ql = "count(x)";

                        for (FieldInterfaced f : sumFields) {
                            if (!"".equals(ql)) ql += ", ";
                            ql += " sum(x." + f.getName() + ") ";
                        }

                        return ql;
                    }, filters, null, 0, 1000);
                    log.debug(q.toString());

                    Object r = q.getSingleResult();

                    if (r instanceof Long) {
                        count[0] = ((Long) r).intValue();
                    } else if (r instanceof Object[]) {
                        Object[] v = (Object[]) r;

                        count[0] = ((Long) v[0]).intValue();


                        NumberFormat nf = new DecimalFormat("#,###,###,###,###,###,###.00");


                        int pos = 1;
                        for (FieldInterfaced f : sumFields) {
                            String caption = "Total " + Helper.capitalize(f.getName());
                            if (!Strings.isNullOrEmpty(f.getAnnotation(Sum.class).caption())) caption = f.getAnnotation(Sum.class).caption();

                            Object x = v[pos++];
                            if (x != null && x instanceof Double) {
                                x = Math.round(100d * (Double) x) / 100d;
                                x = nf.format(x);
                            }

                            sums.add(new SumData(caption, (x != null)?"" + x:"---", ""));
                        }

                    }

                }
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return count[0];
    }


    @Override
    public List<SumData> getSums(Object filters) {
        return sums;
    }

    @Override
    protected List<ChartData> getCharts(Object filters) {
        List<ChartData> l = new ArrayList<>();

        getColumnFields(entityClass).stream().filter(f -> !f.isAnnotationPresent(NoChart.class) && !Literal.class.equals(f.getType()) && (f.getType().isEnum() || (!Resource.class.equals(f.getType()) && f.isAnnotationPresent(ManyToOne.class)) || boolean.class.equals(f.getType()) || Boolean.class.equals(f.getType()))).forEach(f -> l.add(gatherChartData(filters, f)));

        return l;
    }

    private ChartData gatherChartData(Object filters, FieldInterfaced f) {

        List<ChartValue> vs = new ArrayList<>();
        String caption = "By " + Helper.capitalize(f.getName()).toLowerCase();

        try {
            Helper.notransact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, (alias) ->  "x." + f.getName() + ", count(x)" , filters, null, "group by x." + f.getName(), 0, 1000, false);
                    log.debug(q.toString());

                    List<Object[]> r = q.getResultList();

                    for (Object[] l : r) {
                        String s = "";

                        if (l[0] instanceof StyledEnum) s = ((StyledEnum)l[0]).getStyle();

                        vs.add(new ChartValue(l[0],"" + l[0], new Double("" + l[1]), s));
                    }


                }
            });
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }

        ChartData d = new ChartData(f, caption, vs);

        return d;
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

                    //selection.forEach(o -> em.remove(em.find(entityClass, toId(o))));
                    for (Object o : selection) ReflectionHelper.delete(em, em.find(entityClass, toId(o)));

                }
            });
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    @Override
    public void decorateGrid(Grid grid) {
        GridDecorator d = null;
        try {
            Method m = ReflectionHelper.getMethod(entityClass, "getGridDecorator");
            if (m != null) {
                if (Modifier.isStatic(m.getModifiers())) {
                    d = (GridDecorator) m.invoke(null);
                } else {
                    d = (GridDecorator) m.invoke(ReflectionHelper.newInstance(entityClass));
                }
            } else {
                if (GridDecorator.class.isAssignableFrom(entityClass)) {
                    d = (GridDecorator)ReflectionHelper.newInstance(entityClass);
                }
            }
            if (d != null) {
                d.decorateGrid(grid);
            }
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    public ExtraFilters getExtraFilters() {
        return extraFilters;
    }

    public void setExtraFilters(ExtraFilters extraFilters) {
        this.extraFilters = extraFilters;
    }


    @Override
    public Set getSelection() {
        Set sel = new HashSet();

        try {
            Helper.notransact(em -> super.getSelection().forEach(o -> {
                Object v = em.find(entityClass, toId(o));
                sel.add(v != null?v:o);
            }));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }

        return sel;
    }
}
