package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

import javax.persistence.OneToMany;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class JPACollectionFieldViewComponent extends JPAListViewComponent {

    private final FieldInterfaced field;
    private final EditorViewComponent evfc;
    private final boolean addingToCollection;

    public JPACollectionFieldViewComponent(Class entityClass, FieldInterfaced field, EditorViewComponent evfc, boolean addingToCollection) {
        this(entityClass, new ExtraFilters(" x " + ((field.isAnnotationPresent(UseLinkToListView.class) && !addingToCollection) ? "" : " not ") + " in (select q from " + field.getDeclaringClass().getName() + " p join p." + field.getName() + " q where p = :z) ", "z", evfc.getModel()), field, evfc, addingToCollection);
    }

    public JPACollectionFieldViewComponent(Class entityClass, ExtraFilters extraFilters, FieldInterfaced field, EditorViewComponent evfc, boolean addingToCollection) {
        super(entityClass, extraFilters);
        this.field = field;
        this.evfc = evfc;
        this.addingToCollection = addingToCollection;
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
                    MyUI.get().getNavegador().go("add");
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

                    MyUI.get().getNavegador().goBack();
                }
            });
        } else l.add(new AbstractAction("Add selected") {
            @Override
            public void run(MDDExecutionContext context) {

                try {

                    Helper.notransact(em -> {

                        getSelection().forEach(o -> {
                            Object m = evfc.getModel();
                            Object oid = o;


                            Object e = null;

                            if (oid instanceof Object[]) {
                                e = em.find(field.getGenericClass(), ((Object[]) oid)[0]);
                            } else if (oid instanceof EntityProvider) {
                                e = ((EntityProvider) oid).toEntity(em);
                            } else {
                                e = em.find(field.getGenericClass(), oid);
                            }


                            try {
                                ReflectionHelper.addToCollection(evfc.getBinder(), field, m, e);
                            } catch (Exception e1) {
                                MDD.alert(e1);
                            }

                        });

                    });

                    if (field.isAnnotationPresent(UseLinkToListView.class) && addingToCollection) evfc.save(false);

                    MyUI.get().getNavegador().goBack();

                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }


            }
        });

        return l;
    }
}
