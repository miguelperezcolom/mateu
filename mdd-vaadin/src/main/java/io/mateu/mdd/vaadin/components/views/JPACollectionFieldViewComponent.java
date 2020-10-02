package io.mateu.mdd.vaadin.components.views;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.annotations.UseLinkToListView;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class JPACollectionFieldViewComponent extends JPAListViewComponent {

    private final FieldInterfaced field;
    private final IEditorViewComponent evfc;
    private final boolean addingToCollection;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.TASKS; //VaadinIcons.LIST_SELECT; VaadinIcons.BOOKMARK; VaadinIcons.SEARCH; VaadinIcons.THUMBS_UP;
    }

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
            l.add(new MDDRunnableAction("Add items") {
                @Override
                public void run() {
                    MDDUIAccessor.go("add");
                }
            });
            l.add(new MDDRunnableAction("Remove selected items") {
                @Override
                public void run() {

                    try {
                        Object parentBean = evfc.getBinder().getBean();
                        ReflectionHelper.setValue(field, parentBean, ReflectionHelper.removeAll((Collection) ReflectionHelper.getValue(field, parentBean), getSelection()));
                        evfc.getBinder().setBean(parentBean, false);
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }

                    if (field.isAnnotationPresent(UseLinkToListView.class)) {
                        try {

                            evfc.save(false);

                            MDDUIAccessor.goBack();

                        } catch (Throwable throwable) {
                            Notifier.alert(throwable);
                        }
                    }

                }
            });
        } else l.add(new MDDRunnableAction("Add selected") {
            @Override
            public void run() {

                try {

                    JPAHelper.notransact(em -> {

                        getSelection().forEach(o -> {
                            Object m = evfc.getModel();

                            try {
                                ReflectionHelper.addToCollection(field, m, o);
                                evfc.getBinder().setBean(m, false);
                            } catch (Exception e1) {
                                Notifier.alert(e1);
                            }

                        });

                    });

                    if (field.isAnnotationPresent(UseLinkToListView.class) && addingToCollection) evfc.save(false);

                    MDDUIAccessor.goBack();

                } catch (Throwable throwable) {
                    Notifier.alert(throwable);
                }


            }
        });

        return l;
    }

    @Override
    public String toString() {
        return field != null?"Adding " + Helper.capitalize(field.getName()).toLowerCase() + " to " + evfc.toString():super.toString();
    }
}
