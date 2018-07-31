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


                                Collection col = null;
                                try {
                                    col = (Collection) ReflectionHelper.getValue(field, m);

                                    if (col.contains(e)) col.remove(e);
                                    evfc.updateModel(m);

                                    String mb = null;
                                    FieldInterfaced mbf = null;
                                    if (field.isAnnotationPresent(OneToMany.class)) {
                                        mb = field.getAnnotation(OneToMany.class).mappedBy();
                                        if (!Strings.isNullOrEmpty(mb)) {
                                            mbf = ReflectionHelper.getFieldByName(field.getGenericClass(), mb);
                                        }
                                    }
                                    if (mbf != null) {
                                        FieldInterfaced finalMbf = mbf;
                                        try {
                                            ReflectionHelper.setValue(finalMbf, e, null);
                                            evfc.getBinder().getMergeables().add(e);
                                        } catch (Throwable e1) {
                                            MDD.alert(e1);
                                        }
                                    }

                                } catch (Exception e1) {
                                    MDD.alert(e1);
                                }
                            });


                        });
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
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


                            Collection col = null;
                            try {
                                col = (Collection) ReflectionHelper.getValue(field, m);

                                if (!col.contains(e)) col.add(e);
                                evfc.updateModel(m);

                                String mb = null;
                                FieldInterfaced mbf = null;
                                if (field.isAnnotationPresent(OneToMany.class)) {
                                    mb = field.getAnnotation(OneToMany.class).mappedBy();
                                    if (!Strings.isNullOrEmpty(mb)) {
                                        mbf = ReflectionHelper.getFieldByName(field.getGenericClass(), mb);
                                    }
                                }
                                if (mbf != null) {
                                    FieldInterfaced finalMbf = mbf;
                                    try {

                                        Object old = ReflectionHelper.getValue(finalMbf, e);

                                        if (old != null) {
                                            Collection oldCol = (Collection) ReflectionHelper.getValue(field, old);
                                            oldCol.remove(e);
                                            evfc.getBinder().getMergeables().add(old);
                                        }

                                        ReflectionHelper.setValue(finalMbf, e, m);
                                        evfc.getBinder().getMergeables().add(e);
                                    } catch (Throwable e1) {
                                        MDD.alert(e1);
                                    }
                                }

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
