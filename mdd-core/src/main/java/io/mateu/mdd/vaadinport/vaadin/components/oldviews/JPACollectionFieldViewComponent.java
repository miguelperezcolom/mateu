package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class JPACollectionFieldViewComponent extends JPAListViewComponent {

    private final FieldInterfaced field;
    private final IEditorViewComponent evfc;
    private final boolean addingToCollection;

    public JPACollectionFieldViewComponent(Class entityClass, FieldInterfaced field, IEditorViewComponent evfc, boolean addingToCollection) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        this(entityClass, createExtraFields(field, evfc, addingToCollection), field, evfc, addingToCollection);
    }

    private static ExtraFilters createExtraFields(FieldInterfaced field, IEditorViewComponent evfc, boolean addingToCollection) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        ExtraFilters ef = null;
        List ids;
        if ((ids =  getIds(evfc, field)).size() > 0) {
            ef = new ExtraFilters(" x " + ((field.isAnnotationPresent(UseLinkToListView.class) && !addingToCollection) ? "" : " not ") + " in :z ", "z", getIds(evfc, field));
        }
        return ef;
    }

    private static List getIds(IEditorViewComponent evfc, FieldInterfaced field) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        List l = new ArrayList();
        for (Object x : (Collection) ReflectionHelper.getValue(field, evfc.getModel())) l.add(ReflectionHelper.getId(x));
        return l;
    }

    public JPACollectionFieldViewComponent(Class entityClass, ExtraFilters extraFilters, FieldInterfaced field, IEditorViewComponent evfc, boolean addingToCollection) {
        super(entityClass, extraFilters);
        this.field = field;
        this.evfc = evfc;
        this.addingToCollection = addingToCollection;
    }

    @Override
    public void updateExtraFilters() throws Exception {
        setExtraFilters(createExtraFields(field, evfc, addingToCollection));
    }

    public FieldInterfaced getField() {
        return field;
    }

    @Override
    public boolean isAddEnabled() {
        return !field.isAnnotationPresent(UseLinkToListView.class);
    }

    @Override
    public boolean isDeleteEnabled() {
        return !field.isAnnotationPresent(UseLinkToListView.class);
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();

        if (field.isAnnotationPresent(UseLinkToListView.class) && !addingToCollection) {
            l.add(new AbstractAction("Add items") {
                @Override
                public void run(MDDExecutionContext context) {
                    MDDUI.get().getNavegador().go("add");
                }
            });
            l.add(new AbstractAction("Remove selected items") {
                @Override
                public void run(MDDExecutionContext context) {

                    try {
                        ReflectionHelper.removeFromCollection(evfc.getBinder(), field,  evfc.getModel(), getSelection());
                    } catch (Exception e1) {
                        MDD.alert(e1);
                    }

                    if (field.isAnnotationPresent(UseLinkToListView.class)) {
                        try {

                            evfc.save(false);

                            MDDUI.get().getNavegador().goBack();

                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                    }

                }
            });
        } else l.add(new AbstractAction("Add selected") {
            @Override
            public void run(MDDExecutionContext context) {

                try {

                    Helper.notransact(em -> {

                        getSelection().forEach(o -> {
                            Object m = evfc.getModel();

                            try {
                                ReflectionHelper.addToCollection(evfc.getBinder(), field, m, o);
                            } catch (Exception e1) {
                                MDD.alert(e1);
                            }

                        });

                    });

                    if (field.isAnnotationPresent(UseLinkToListView.class) && addingToCollection) evfc.save(false);

                    MDDUI.get().getNavegador().goBack();

                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }


            }
        });

        return l;
    }
}
