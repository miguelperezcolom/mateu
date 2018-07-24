package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class RpcListViewComponent extends ListViewComponent {

    private final Class rpcListViewClass;
    private final RpcView rpcListView;
    private final Class columnType;

    public RpcListViewComponent(Class rpcListViewClass) throws IllegalAccessException, InstantiationException {
        this.rpcListViewClass = rpcListViewClass;
        this.rpcListView = (RpcView) rpcListViewClass.newInstance();
        this.columnType = ReflectionHelper.getGenericClass(rpcListViewClass, RpcView.class, "C");

    }

    @Override
    public String toString() {
        return Helper.pluralize(Helper.capitalize(rpcListViewClass.getSimpleName()));
    }

    @Override
    public Class getModelTypeForSearchFilters() {
        return rpcListViewClass;
    }

    @Override
    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException {
        return rpcListView;
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

        for (Method m : ReflectionHelper.getAllMethods(rpcListViewClass)) {
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



    @Override
    public List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        return rpcListView.rpc(filters, offset, limit);
    }

    @Override
    protected int gatherCount(Object filters) {
        return rpcListView.gatherCount(filters);
    }

    @Override
    public Object deserializeId(String sid) {
        return (rpcListView instanceof RpcCrudView)?((RpcCrudView) rpcListView).deserializeId(sid):null;
    }


    @Override
    public boolean isAddEnabled() {
        return rpcListView instanceof RpcCrudView &&  ((RpcCrudView)rpcListView).isAddEnabled();
    }
}
