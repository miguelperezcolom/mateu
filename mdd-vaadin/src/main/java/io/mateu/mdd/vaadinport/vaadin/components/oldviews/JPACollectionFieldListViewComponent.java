package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

public class JPACollectionFieldListViewComponent extends JPAListViewComponent {

    private final FieldInterfaced field;
    private final IEditorViewComponent evfc;
    private List list;
    private Object model;

    public JPACollectionFieldListViewComponent(Class entityClass, FieldInterfaced field, IEditorViewComponent evfc) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        super(entityClass);
        this.field = field;
        this.evfc = evfc;
        this.model = evfc.getModel();
        this.list = (List) ReflectionHelper.getValue(field, model);
    }

    public FieldInterfaced getField() {
        return field;
    }

    public IEditorViewComponent getEvfc() {
        return evfc;
    }

    @Override
    public boolean isAddEnabled() {
        return false;
    }

    @Override
    public boolean isDeleteEnabled() {
        return false;
    }

    public boolean canAdd() {
        return ReflectionHelper.isOwnedCollection(field) || (field.isAnnotationPresent(UseLinkToListView.class) && field.getAnnotation(UseLinkToListView.class).addEnabled());
    }

    public boolean canDelete() {
        return ReflectionHelper.isOwnedCollection(field) || (field.isAnnotationPresent(UseLinkToListView.class) && field.getAnnotation(UseLinkToListView.class).deleteEnabled());
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();

            if (canAdd()) l.add(new AbstractAction("Add") {
                @Override
                public void run(MDDExecutionContext context) {
                    MDDUI.get().getNavegador().go("add");
                }
            });
            if (canDelete()) l.add(new AbstractAction("Remove selected items") {
                @Override
                public void run(MDDExecutionContext context) {

                    if (resultsComponent.getSelection().size() == 0) MDD.alert("No item selected");
                    else MDD.confirm("Are you sure?", new Runnable() {
                        @Override
                        public void run() {

                            try {

                                Set borrar = resultsComponent.getSelection();

                                ((List) ReflectionHelper.getValue(field, model)).removeAll(borrar);

                                evfc.getBinder().setBean(evfc.getModel(), false);

                                evfc.getBinder().getRemovables().addAll(borrar);

                                evfc.save(false);


                                MDDUI.get().getNavegador().goBack();

                            } catch (Throwable e) {
                                MDD.alert(e);
                            }

                        }
                    });


                }
            });

        return l;
    }

    @Override
    public List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        return list;
    }

    @Override
    public int count(Object filters) throws Throwable {
        return list.size();
    }

    @Override
    public void edit(Object id) {
        MDDUI.get().getNavegador().go("" + id);
    }


    public Object addNew() throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        Object o = getModelType().newInstance();
        //ReflectionHelper.reverseMap(evfc.getBinder(), field, evfc.getModel(), o);
        /// lo hemos movido al onsave
        return o;
    }

    public Object getItem(String sid) {
        Object id = deserializeId(sid);
        Object f = null;
        for (Object o : list) if (id.equals(toId(o))) {
            f = o;
            break;
        }
        return f;
    }

    public void saved(Object o) throws Throwable {
        //list.add(o);
        evfc.getBinder().setBean(evfc.getModel(), false);
        //evfc.save(false, false);
        search(this);
    }


    @Override
    public void decorateGrid(Grid grid) {
        if (field.getAnnotation(UseLinkToListView.class) != null && !Strings.isNullOrEmpty(field.getAnnotation(UseLinkToListView.class).fields())) {
            List<String> fns = Lists.newArrayList(field.getAnnotation(UseLinkToListView.class).fields().replaceAll(" ", "").split(","));
            for (Grid.Column col : (List<Grid.Column>) grid.getColumns()) {
                if (col.getId() != null && !fns.contains(col.getId())) col.setHidden(true);
            }
        } else {
            super.decorateGrid(grid);
        }
    }

    public void preSave(Object model) throws Throwable {
        ReflectionHelper.addToCollection(evfc.getBinder(), field, this.evfc.getModel(), model);
    }
}
