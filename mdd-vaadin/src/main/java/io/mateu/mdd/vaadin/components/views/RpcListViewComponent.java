package io.mateu.mdd.vaadin.components.views;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.shared.data.ChartData;
import io.mateu.mdd.shared.data.SumData;
import io.mateu.mdd.core.interfaces.AbstractCrudView;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.StepInterceptor;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class RpcListViewComponent extends ListViewComponent {

    private final Class rpcListViewClass;
    private RpcView rpcListView;
    private final Class columnType;

    public RpcView getRpcListView() {
        return rpcListView;
    }

    public RpcListViewComponent(RpcView rpcListView) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        this.rpcListViewClass = rpcListView.getClass();
        this.rpcListView = rpcListView;
        this.columnType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "C");
        addListener(new ListViewComponentListener() {
            @Override
            public void onEdit(Object id) {
                if (rpcListView.isEditHandled()) {
                    try {
                        MDDUI.get().getNavegador().setPendingResult(rpcListView.onEdit(id));
                        MDDUIAccessor.go("" + id);
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                }
            }

            @Override
            public void onSelect(Object id) {
                if (rpcListView.isSelectHandled()) {
                    MDDUI.get().getNavegador().setPendingResult(rpcListView.onSelect(id));
                    MDDUIAccessor.go("" + id);
                }
            }
        });
    }


    public RpcListViewComponent(Class rpcListViewClass) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        this.rpcListViewClass = rpcListViewClass;
        this.rpcListView = (RpcView) ReflectionHelper.newInstance(rpcListViewClass);
        this.columnType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "C");
        addListener(new ListViewComponentListener() {
            @Override
            public void onEdit(Object id) {
                if (rpcListView.isEditHandled()) {
                    try {
                        MDDUI.get().getNavegador().setPendingResult(rpcListView.onEdit(id));
                        MDDUIAccessor.go("" + id);
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                } else {
                    MDDUIAccessor.go("" + id);
                }
            }

            @Override
            public void onSelect(Object id) {
                if (rpcListView.isSelectHandled()) {
                    MDDUI.get().getNavegador().setPendingResult(rpcListView.onSelect(id));
                    MDDUIAccessor.go("" + id);
                }
            }
        });
    }

    @Override
    public String toString() {
        return Helper.pluralize(Helper.capitalize(rpcListViewClass.getSimpleName()));
    }

    @Override
    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException {
        return rpcListView;
    }

    @Override
    public void setModelForSearchFilters(Object filters) {
        filtersComponent.getBinder().setBean(filters);
        rpcListView = (RpcView) filters;
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
        return rpcListViewClass;
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

        ms.forEach(m -> l.add(ViewComponentHelper.createAction(m, this)));

        return l;
    }



    @Override
    public List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        try {
            return rpcListView.rpc(filters, sortOrders, offset, limit);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            return null;
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
    public void decorateGrid(Grid grid) {
        rpcListView.decorateGrid(grid);
    }

    @Override
    public Class getModelType() {
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
        if (getRpcListView() instanceof StepInterceptor) return ((StepInterceptor) getRpcListView()).onEdit(step);
        Object row = resultsComponent.getRow(step);
        return getRpcListView().onEdit(row);
    }
}
