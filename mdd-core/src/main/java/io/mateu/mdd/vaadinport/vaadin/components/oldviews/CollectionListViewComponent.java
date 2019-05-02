package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Grid;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.ChartData;
import io.mateu.mdd.core.data.SumData;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.stream.Collectors;

public class CollectionListViewComponent extends ListViewComponent {

    private List collection;
    private final Class columnType;

    public CollectionListViewComponent(Collection collection, Class columnType) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        this.collection = Lists.newArrayList(collection);
        this.columnType = columnType;
        addListener(new ListViewComponentListener() {
            @Override
            public void onEdit(Object id) {
                try {
                    MDDUI.get().getNavegador().setPendingResult(id);
                    MDDUI.get().getNavegador().go("" + id);
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }

            @Override
            public void onSelect(Object id) {
                /*
                if (rpcListView.isSelectHandled()) {
                    MDDUI.get().getNavegador().setPendingResult(rpcListView.onSelect(id));
                    MDDUI.get().getNavegador().go("" + id);
                }
                */
            }
        });
    }


    @Override
    public String toString() {
        return Helper.pluralize(Helper.capitalize(columnType.getSimpleName()));
    }

    @Override
    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException {
        return getFiltersType().newInstance();
    }

    @Override
    public void setModelForSearchFilters(Object filters) {
        filtersComponent.getBinder().setBean(filters);
    }


    @Override
    public Class getColumnType() {
        return columnType;
    }

    @Override
    public Class getFiltersType() {
        try {
            return ReflectionHelper.createClass(columnType.getName() + "000CollectionFilters", getFilterFields(columnType), true);
        } catch (Exception e) {
            MDD.alert(e);
        }
        return null;
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();


        List<Method> ms = new ArrayList<>();

        for (Method m : ReflectionHelper.getAllMethods(columnType)) {
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
        try {
            return (List) collection.stream().filter(o -> filtrar(o, filters)).sorted(getComparator(sortOrders)).skip(offset).limit(limit).collect(Collectors.toList());
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            return null;
        }
    }

    private boolean filtrar(Object o, Object filters) {
        boolean ok = true;
        if (filters != null) {
            for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(filters.getClass())) {
                FieldInterfaced fo = ReflectionHelper.getFieldByName(o.getClass(), f.getName());
                try {
                    Object o1 = ReflectionHelper.getValue(f, filters);

                    if (o1 != null) {
                        if (o != null) {

                            Object o2 = ReflectionHelper.getValue(fo, o);

                            if (o1 instanceof String) {
                                o2.toString().toLowerCase().contains(((String) o1).toLowerCase());
                            } else {
                                ok = o1.equals(o2);
                            }

                        } else ok = false;
                    }

                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
                if (!ok) break;
            }
        }
        return ok;
    }

    private Comparator getComparator(List<QuerySortOrder> sortOrders) {
        return new Comparator() {
            @Override
            public int compare(Object o1, Object o2) {
                int r = 0;
                for (QuerySortOrder sortOrder : sortOrders) {
                    FieldInterfaced f = ReflectionHelper.getFieldByName(getColumnType(), sortOrder.getSorted());
                    if (f != null) {
                        try {
                            Object x1 = ReflectionHelper.getValue(f, o1);
                            Object x2 = ReflectionHelper.getValue(f, o2);

                            if (x1 != null && x1 instanceof Comparable) r = x2 != null?((Comparable) x1).compareTo(x2):1;
                            else r = -1;

                            if (SortDirection.DESCENDING.equals(sortOrder.getDirection())) r *= -1;

                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }
                    }
                    if (r != 0) break;
                }
                return r;
            }
        };
    }

    @Override
    protected int gatherCount(Object filters) throws Throwable {
        return (int) collection.stream().filter(o -> filtrar(o, filters)).count();
        //return rpcListView.gatherCount(filters);
    }

    @Override
    protected List<SumData> getSums(Object filters) {
        return new ArrayList<>();
        //return rpcListView.getSums(filters);
    }

    @Override
    protected List<ChartData> getCharts(Object filters) {
        return null;
    }

    @Override
    public Object deserializeId(String sid) {
        Optional o = collection.stream().filter(x -> sid.equals(ReflectionHelper.getId(x).toString())).findFirst();
        return o.isPresent()?o.get():null;
    }


    @Override
    public boolean isAddEnabled() {
        return false;
    }

    @Override
    public void decorateGrid(Grid grid) {
        //rpcListView.decorateGrid(grid);
    }

    @Override
    public Class getModelType() {
        return columnType;
    }
}
