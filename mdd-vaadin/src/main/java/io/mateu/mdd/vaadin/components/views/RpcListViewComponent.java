package io.mateu.mdd.vaadin.components.views;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Notification;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.Subtitle;
import io.mateu.mdd.shared.data.ChartData;
import io.mateu.mdd.shared.data.SumData;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class RpcListViewComponent extends ListViewComponent {

    private final Class rpcListViewClass;
    private Object filters;
    private RpcView rpcListView;
    private final Class filtersType;
    private final Class columnType;

    public RpcView getRpcListView() {
        return rpcListView;
    }

    public RpcListViewComponent(FieldInterfaced field, RpcView rpcListView) throws InvocationTargetException, IllegalAccessException, InstantiationException, NoSuchMethodException {
        this(rpcListView);
        this.field = field;
    }

    public RpcListViewComponent(FieldInterfaced field, Class rpcListViewClass) throws InvocationTargetException, IllegalAccessException, InstantiationException, NoSuchMethodException {
        this(rpcListViewClass);
        this.field = field;
    }

    @Override
    public boolean mustAddBreadcrumb() {
        return field == null;
    }

    public RpcListViewComponent(RpcView rpcListView) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        this.rpcListViewClass = rpcListView.getClass();
        this.rpcListView = rpcListView;
        this.filtersType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "F");
        this.filters = (filtersType.equals(rpcListViewClass))?rpcListView:ReflectionHelper.newInstance(filtersType);
        this.columnType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "C");
        addListener(new ListViewComponentListener() {
            @Override
            public void onEdit(Object id) {
                if (rpcListView.isEditHandled()) {
                    try {
                        Object dto = rpcListView.onEdit(id);
                        if (dto == null) dto = id;
                        MateuUI.get().setPendingResult(dto);
                        MDDUIAccessor.go(getFieldPrefix() + Base64.getEncoder().encodeToString(("" + id).getBytes(StandardCharsets.UTF_8)));
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                }
            }

            @Override
            public void onSelect(Object id) {
                if (rpcListView.isSelectHandled()) {
                    Object dto = rpcListView.onSelect(id);
                    if (dto == null) dto = id;
                    MateuUI.get().setPendingResult(dto);
                    MDDUIAccessor.go(getFieldPrefix() + Base64.getEncoder().encodeToString(("" + id).getBytes(StandardCharsets.UTF_8)));
                }
            }
        });
    }


    public RpcListViewComponent(Class rpcListViewClass) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        this.rpcListViewClass = rpcListViewClass;
        this.rpcListView = (RpcView) ReflectionHelper.newInstance(rpcListViewClass);
        this.filtersType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "F");
        this.filters = (filtersType.equals(rpcListViewClass))?rpcListView:ReflectionHelper.newInstance(filtersType);
        this.columnType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "C");
        addListener(new ListViewComponentListener() {
            @Override
            public void onEdit(Object id) {
                if (rpcListView.isEditHandled()) {
                    try {
                        Object dto = rpcListView.onEdit(id);
                        if (dto == null) dto = id;
                        MateuUI.get().setPendingResult(dto);
                        MDDUIAccessor.go(getFieldPrefix() + Base64.getEncoder().encodeToString(("" + id).getBytes(StandardCharsets.UTF_8)));
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                } else {
                    MDDUIAccessor.go(getFieldPrefix() + Base64.getEncoder().encodeToString(("" + id).getBytes(StandardCharsets.UTF_8)));
                }
            }

            @Override
            public void onSelect(Object id) {
                if (rpcListView.isSelectHandled()) {
                    Object dto = rpcListView.onSelect(id);
                    if (dto == null) dto = id;
                    MateuUI.get().setPendingResult(dto);
                    MDDUIAccessor.go(getFieldPrefix() + Base64.getEncoder().encodeToString(("" + id).getBytes(StandardCharsets.UTF_8)));
                }
            }
        });
    }

    @Override
    public String toString() {
        return getTitle();
    }

    @Override
    public String getTitle() {
        try {
            if (rpcListView instanceof HasTitle) return ((HasTitle) rpcListView).getTitle();
            if (!rpcListViewClass.getMethod("toString").getDeclaringClass().equals(Object.class)) {
                return rpcListView.toString();
            }
        } catch (NoSuchMethodException e) {
        }
        return Helper.pluralize(Helper.capitalize(rpcListViewClass.getSimpleName()));
    }

    @Override
    public String getSubtitle() {
        String subtitle ="";
        if (rpcListView instanceof HasSubtitle) subtitle = ((HasSubtitle) rpcListView).getSubtitle();
        return subtitle;
    }

    @Override
    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException {
        return filters;
    }

    @Override
    public void setModelForSearchFilters(Object filters) {
        filtersComponent.getBinder().setBean(filters);
        this.filters = filters;
    }

    @Override
    public void buildColumns(Grid grid) {
        rpcListView.buildColumns(grid);
        if (grid.getColumns().size() == 0) super.buildColumns(grid);
    }

    @Override
    public Class getColumnType() {
        return columnType;
    }

    @Override
    public Class getFiltersType() {
        return filtersType;
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();


        List<Method> ms = new ArrayList<>();

        if (AbstractCrudView.class.isAssignableFrom(rpcListViewClass)) {
            for (Method m : ReflectionHelper.getAllMethods(ReflectionHelper.getGenericClass(rpcListViewClass, AbstractCrudView.class, "R"))) {
                if (Modifier.isStatic(m.getModifiers()) && m.isAnnotationPresent(Action.class)) {
                    ms.add(m);
                }
            }
        }

        for (Method m : ReflectionHelper.getAllMethods(rpcListViewClass)) {
            if (m.isAnnotationPresent(Action.class)) {
                ms.add(m);
            }
        }

        ms.sort((a, b) -> {
            return a.getAnnotation(Action.class).order() - b.getAnnotation(Action.class).order();
        });

        ms.forEach(m -> l.add(ViewComponentHelper.createAction(field, m, this)));

        return l;
    }



    @Override
    public List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        List rows = null;
        try {
            rows = rpcListView.rpc(filters, sortOrders, offset, limit);
            if (rows == null) throw new Exception("Returned rows can not be null");
            //if (rows.size() < limit) throw new Exception("Returned rows should be at least " + limit);
            return rows;
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
            if (rows == null) {
                rows = new ArrayList();
            }
            for (int i = rows.size(); i < limit; i++) {
                rows.add(UUID.randomUUID().toString());
            }
            return rows;
        }
    }

    @Override
    protected int gatherCount(Object filters) throws Throwable {
        return rpcListView.gatherCount(filters);
    }

    @Override
    protected List<SumData> getSums(Object filters) {
        return rpcListView.getSums(filters);
    }

    @Override
    protected List<ChartData> getCharts(Object filters) {
        return null;
    }

    @Override
    public Object deserializeId(String sid) {
        return (rpcListView instanceof RpcCrudView)?((RpcCrudView) rpcListView).deserializeId(sid):null;
    }


    @Override
    public boolean isAddEnabled() {
        return rpcListView instanceof RpcCrudView &&  ((RpcCrudView)rpcListView).isAddEnabled();
    }

    @Override
    public boolean isDeleteEnabled() {
        return rpcListView instanceof RpcCrudView &&  ((RpcCrudView)rpcListView).isDeleteEnabled();
    }

    @Override
    protected void delete(Set selection) {
        if (rpcListView instanceof RpcCrudView) ((RpcCrudView)rpcListView).delete(selection);
    }

    @Override
    public void decorateGrid(Grid grid) {
        rpcListView.decorateGrid(grid);
    }

    @Override
    public Class getModelType() {
        if (rpcListView instanceof RpcCrudView) return ReflectionHelper.getGenericClass(rpcListView.getClass(), RpcCrudView.class, "T");
        return rpcListView.getClass();
    }

    @Override
    public Method getMethod(String methodName) {
        Method a = super.getMethod(methodName);

        if (a == null) {
            if (AbstractCrudView.class.isAssignableFrom(rpcListViewClass)) {
                for (Method m : ReflectionHelper.getAllMethods(ReflectionHelper.getGenericClass(rpcListViewClass, AbstractCrudView.class, "R"))) {
                    if (Modifier.isStatic(m.getModifiers()) && m.isAnnotationPresent(Action.class)) {
                        if (methodName.equals(m.getName())) {
                            a = m;
                            break;
                        }
                    }
                }
            }
        }
        return a;
    }

    public Object onEdit(String step) throws Throwable {
        if (MDDUIAccessor.getPendingResult() != null) {
            Object r = MDDUIAccessor.getPendingResult();
            MDDUIAccessor.setPendingResult(null);
            return r;
        }
        if (resultsComponent == null) return null;
        if (getRpcListView() instanceof StepInterceptor) return ((StepInterceptor) getRpcListView()).onEdit(step);
        Object row = resultsComponent.getRow(step);
        if (row == null) {
            if (ReadOnlyPojo.class.isAssignableFrom(getModelType())) {
                Object i = ReflectionHelper.newInstance(getModelType());
                ((ReadOnlyPojo)i).load(step);
                return i;
            }
            row = deserializeId(step);
        }
        return getRpcListView().onEdit(row);
    }
}
