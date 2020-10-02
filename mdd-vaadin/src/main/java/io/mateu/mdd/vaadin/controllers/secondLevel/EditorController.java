package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.data.Binder;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.UseLinkToListView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.app.views.secondLevel.FieldEditorComponent;
import io.mateu.mdd.vaadin.components.views.*;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.navigation.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.*;
import java.lang.reflect.Method;
import java.util.Optional;

public class EditorController extends Controller {

    private final EditorViewComponent editorViewComponent;

    public EditorController(ViewStack stack, String path, EditorViewComponent editorViewComponent) {
        this.editorViewComponent = editorViewComponent;
        register(stack, path, editorViewComponent);
    }

    public EditorController(ViewStack stack, String path, Object bean) {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(bean);
        register(stack, path, editorViewComponent);
    }

    public EditorController(ViewStack stack, String path, MDDOpenEditorAction action) throws Exception {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(action);
        register(stack, path, editorViewComponent);
    }

    public EditorController(ViewStack stack, String path, ListViewComponent listViewComponent, Object bean) {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(bean);
        editorViewComponent.setListViewComponent(listViewComponent);
        register(stack, path, editorViewComponent);
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {


        if (!"".equals(step)) {

            Object r = null;
            Method method = null;
            FieldInterfaced field = null;

            if (editorViewComponent != null) {
                r = editorViewComponent.getModel();
                method = editorViewComponent.getMethod(step);
                field = editorViewComponent.getField(step);
            }
            if (r != null) {
                method = ReflectionHelper.getMethod(r.getClass(), step);
                field = ReflectionHelper.getFieldByName(r.getClass(), step.endsWith("_search") ? step.replaceAll("_search", "") : step);
            }

            if (method != null) {

                //callMethod(state, method, r, (Component) editorViewComponent);
                new MethodController(stack, path + "/" + step, method).next(stack, path, step, remaining);

            } else if (field != null) {

                boolean ownedCollection = ReflectionHelper.isOwnedCollection(field);

                if (field.isAnnotationPresent(UseLinkToListView.class)) {

                    UseLinkToListView aa = field.getAnnotation(UseLinkToListView.class);

                    {

                        ListViewComponent lvc = null;
                        Component vc = null;

                        if (!Void.class.equals(aa.listViewClass())) {

                            vc = lvc = new RpcListViewComponent(aa.listViewClass());

                        } else {

                            if (field.isAnnotationPresent(ManyToOne.class)) {

                                vc = lvc = new JPAListViewComponent(field.getType());

                            } else {

                                vc = lvc = new JPACollectionFieldListViewComponent(field.getGenericClass(), field, editorViewComponent);

                            }


                        }

                        if (field.isAnnotationPresent(ManyToOne.class)) {

                            FieldInterfaced finalField = field;
                            lvc.addListener(new ListViewComponentListener() {
                                @Override
                                public void onEdit(Object id) {

                                }

                                @Override
                                public void onSelect(Object id) {
                                    Optional o = (Optional) id;
                                    if (o.isPresent()) {

                                        try {

                                            JPAHelper.notransact(em -> {

                                                Object m = editorViewComponent.getModel();
                                                Object oid = o.get();


                                                Object e = null;

                                                if (oid instanceof Object[]) {
                                                    e = em.find(finalField.getType(), ((Object[]) oid)[0]);
                                                } else if (oid instanceof EntityProvider) {
                                                    e = ((EntityProvider) oid).toEntity(em);
                                                } else {
                                                    e = em.find(finalField.getType(), oid);
                                                }

                                                ReflectionHelper.setValue(finalField, m, e);
                                                editorViewComponent.updateModel(m);

                                                MDDUIAccessor.goBack();

                                            });
                                        } catch (Throwable throwable) {
                                            Notifier.alert(throwable);
                                        }

                                    }
                                }
                            });

                        }

                        register(stack, path + "/" + step, vc);

                    }
                } else if (ownedCollection) {

                    register(stack, path + "/" + step, new OwnedCollectionComponent(editorViewComponent.getBinder(), field, field.isAnnotationPresent(UseLinkToListView.class) ? -1 : 0));

                } else if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {

                    ListViewComponent lvc = null;
                    Component vc = null;

                    if (field.isAnnotationPresent(UseLinkToListView.class)) editorViewComponent.save(false);

                    vc = new JPACollectionFieldViewComponent(field.getGenericClass(), field, editorViewComponent, false);

                    register(stack, path + "/" + step, vc);

                } else {

                    MDDBinder binder = editorViewComponent.getBinder();
                    if (editorViewComponent.getCreatorWindow() != null) binder = editorViewComponent.getCreatorWindow().getBinder();
                    register(stack, path + "/" + step, procesarFieldEditor(binder, field, step));

                }

            }

        }


        /*
        if (method != null) {

            callMethod(state, method, r, (Component) editorViewComponent);

        } else if (field != null) {


            boolean ownedCollection = ReflectionHelper.isOwnedCollection(field);

            if (field.isAnnotationPresent(UseLinkToListView.class)) {

                UseLinkToListView aa = field.getAnnotation(UseLinkToListView.class);

                {

                    ListViewComponent lvc = null;
                    Component vc = null;

                    if (!Void.class.equals(aa.listViewClass())) {

                        vc = lvc = new RpcListViewComponent(aa.listViewClass());

                    } else {

                        if (field.isAnnotationPresent(ManyToOne.class)) {

                            vc = lvc = new JPAListViewComponent(field.getType());

                        } else {

                            vc = lvc = new JPACollectionFieldListViewComponent(field.getGenericClass(), field, editorViewComponent);

                        }


                    }

                    if (field.isAnnotationPresent(ManyToOne.class)) {

                        FieldInterfaced finalField = field;
                        lvc.addListener(new ListViewComponentListener() {
                            @Override
                            public void onEdit(Object id) {

                            }

                            @Override
                            public void onSelect(Object id) {
                                log.debug("Han seleccionado " + id);
                                Optional o = (Optional) id;
                                if (o.isPresent()) {

                                    try {

                                        JPAHelper.notransact(em -> {

                                            Object m = editorViewComponent.getModel();
                                            Object oid = o.get();


                                            Object e = null;

                                            if (oid instanceof Object[]) {
                                                e = em.find(finalField.getType(), ((Object[]) oid)[0]);
                                            } else if (oid instanceof EntityProvider) {
                                                e = ((EntityProvider) oid).toEntity(em);
                                            } else {
                                                e = em.find(finalField.getType(), oid);
                                            }

                                            ReflectionHelper.setValue(finalField, m, e);
                                            editorViewComponent.updateModel(m);

                                            MDDUIAccessor.goBack();

                                        });
                                    } catch (Throwable throwable) {
                                        Notifier.alert(throwable);
                                    }

                                }
                            }
                        });

                    }

                    return vc;

                }
            } else if (ownedCollection) {

                return new OwnedCollectionComponent(editorViewComponent.getBinder(), field, field.isAnnotationPresent(UseLinkToListView.class) ? -1 : 0);

            } else if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {

                ListViewComponent lvc = null;
                Component vc = null;

                if (field.isAnnotationPresent(UseLinkToListView.class)) editorViewComponent.save(false);

                vc = new JPACollectionFieldViewComponent(field.getGenericClass(), field, editorViewComponent, false);

                return vc;

            } else {

                MDDBinder binder = editorViewComponent.getBinder();
                if (editorViewComponent.getCreatorWindow() != null) binder = editorViewComponent.getCreatorWindow().getBinder();
                procesarFieldEditor(binder, field, step);

            }

        } else if (editorViewComponent instanceof OwnedCollectionComponent) {

            int index = Integer.parseInt(step);
            try {
                ((OwnedCollectionComponent) editorViewComponent).setIndex(index);
            } catch (Exception e) {
                Notifier.alert(e);
            }

        }

         */

    }


    private Component procesarFieldEditor(MDDBinder parentBinder, FieldInterfaced field, String step) throws Throwable {
        if (step.endsWith("_search")) {
            return MDDViewComponentCreator.createSearcherComponent(parentBinder, field);
        } else if (ReflectionHelper.isBasico(field.getType())) {
            return new FieldEditorComponent(parentBinder, field);
        } else {
            Object o = ReflectionHelper.getValue(field, parentBinder.getBean());
            boolean add = o == null;
            EditorViewComponent evc = add?new EditorViewComponent(field.getType()):new EditorViewComponent(o);
            if (add) evc.load(null);
            if (field.isAnnotationPresent(ManyToOne.class) && field.getAnnotation(ManyToOne.class).cascade() != null) for (CascadeType c : field.getAnnotation(ManyToOne.class).cascade()) {
                if (CascadeType.ALL.equals(c) || CascadeType.MERGE.equals(c)) {
                    evc.setCreateSaveButton(false);
                    break;
                }
            }

            evc.addEditorListener(new EditorListener() {
                @Override
                public void preSave(Object model) throws Throwable {

                }

                @Override
                public void onSave(Object model) {
                    try {
                        Object m = parentBinder.getBean();
                        ReflectionHelper.setValue(field, m, model);
                        parentBinder.getBinding(field.getName()).ifPresent(b -> {
                            ((Binder.Binding)b).getField().setValue(null);
                            ((Binder.Binding)b).getField().setValue(model);
                        });
                        parentBinder.setBean(m, false);
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }

                @Override
                public void onGoBack(Object model) {
                    if ((field.isAnnotationPresent(Embedded.class)) || (field.getDeclaringClass().isAnnotationPresent(Entity.class) && field.isAnnotationPresent(Convert.class))) {
                        Object m = parentBinder.getBean();
                        try {
                            ReflectionHelper.setValue(field, m, model);
                            parentBinder.setBean(m, false);
                        } catch (Exception e) {
                            Notifier.alert(e);
                        }
                    }
                }
            });
            return evc;
        }
    }

}
