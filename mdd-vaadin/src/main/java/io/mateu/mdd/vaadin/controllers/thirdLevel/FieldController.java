package io.mateu.mdd.vaadin.controllers.thirdLevel;

import com.vaadin.data.Binder;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.interfaces.EntityProvider;
import io.mateu.mdd.core.interfaces.ListView;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.UseLinkToListView;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.app.views.secondLevel.FieldEditorComponent;
import io.mateu.mdd.vaadin.components.app.views.secondLevel.FiltersViewFlowComponent;
import io.mateu.mdd.vaadin.components.views.*;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.secondLevel.EditorController;
import io.mateu.mdd.vaadin.controllers.secondLevel.ListViewComponentController;
import io.mateu.mdd.vaadin.controllers.secondLevel.ReadOnlyController;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.*;
import java.lang.reflect.Method;
import java.util.Optional;

public class FieldController extends Controller {

    private final FieldInterfaced field;
    private final EditorViewComponent editorViewComponent;
    private ListViewComponent listViewComponent;

    public FieldController(ViewStack stack, String path, FieldInterfaced field, EditorViewComponent editorViewComponent) {
        this.field = field;
        this.editorViewComponent = editorViewComponent;

        try {

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

                    register(stack, path, vc);

                }
            } else if (ownedCollection) {

                int indice = 0;

                Object pendingResult = MateuUI.get().getPendingResult();
                if (pendingResult instanceof Integer) {
                    indice = (int) pendingResult;
                    MateuUI.get().setPendingResult(null);
                }

                register(stack, path, new OwnedCollectionComponent(editorViewComponent.getBinder(), field, field.isAnnotationPresent(UseLinkToListView.class) ? -1 : indice));

            } else if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {

                ListViewComponent lvc = null;
                Component vc = null;

                if (field.isAnnotationPresent(UseLinkToListView.class)) editorViewComponent.save(false);

                vc = new JPACollectionFieldViewComponent(field.getGenericClass(), field, editorViewComponent, false);

                register(stack, path, vc);

            } else {

                MDDBinder binder = editorViewComponent.getBinder();
                if (editorViewComponent.getCreatorWindow() != null) binder = editorViewComponent.getCreatorWindow().getBinder();
                register(stack, path, procesarFieldEditor(binder, field, path));

            }

        } catch (Throwable e) {
            Notifier.alert(e);
        }

    }

    private Component procesarFieldEditor(MDDBinder parentBinder, FieldInterfaced field, String step) throws Throwable {
        if (step.endsWith("_search")) {
            return listViewComponent = MDDViewComponentCreator.createSearcherComponent(parentBinder, field);
        } else if (ReflectionHelper.isBasico(field.getType())) {
            return new FieldEditorComponent(parentBinder, field);
        } else if (RpcView.class.isAssignableFrom(field.getType())) {
            return new RpcViewFieldViewComponent(field, editorViewComponent);
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
                    if (true || (field.isAnnotationPresent(Embedded.class)) || (field.getDeclaringClass().isAnnotationPresent(Entity.class) && field.isAnnotationPresent(Convert.class))) {
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

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(cleanStep)) {

            AbstractViewComponent topViewComponentInStack = stack.getLast().getViewComponent();
            ListViewComponent listViewComponent = topViewComponentInStack instanceof ListViewComponent ? (ListViewComponent) topViewComponentInStack : null;
            EditorViewComponent editorViewComponent = topViewComponentInStack instanceof EditorViewComponent ? (EditorViewComponent) topViewComponentInStack : null;
            if (RpcView.class.isAssignableFrom(field.getType())) {
                RpcViewFieldViewComponent rpcViewFieldViewComponent = (RpcViewFieldViewComponent) topViewComponentInStack;
                editorViewComponent = rpcViewFieldViewComponent.getEditorViewComponent();
                listViewComponent = editorViewComponent.getEmbeddedListViewComponents().get(field);
            }

            if (listViewComponent != null) {
                if ("filters".equals(step)) {
                    register(stack, path + "/" + step, new FiltersViewFlowComponent(listViewComponent));
                } else if ("new".equals(step)) {

                    Object form = null;
                    if (listViewComponent instanceof RpcListViewComponent) {
                        form = ((RpcListViewComponent)listViewComponent).getRpcListView().onNew();
                    }
                    EditorViewComponent editor = null;
                    if (form != null) {
                        if (form instanceof RpcView) register(stack, path + "/" + step, new RpcListViewComponent((RpcView) form));
                        else if (!(form instanceof Component)) {
                            if (form instanceof PersistentPojo) new EditorController(stack, path + "/" + step, form).next(stack, path, step, remaining);
                            if (form instanceof ReadOnlyPojo) new ReadOnlyController(stack, path + "/" + step, form).next(stack, path, step, remaining);
                            else new EditorController(stack, path + "/" + step, form).next(stack, path, step, remaining);
                        } else register(stack, path + "/" + step, (Component) form);
                    } else {
                        editor = new EditorViewComponent(listViewComponent, listViewComponent.getModelType());
                        editor.load(null);
                        new EditorController(stack, path + "/" + step, editor).next(stack, path, step, remaining);
                    }
                } else {

                    Method method = listViewComponent.getMethod(step);

                    if (method != null) {
                        new MethodController(stack, path + "/" + step, method).next(stack, path, step, remaining);
                    } else {

                        if (listViewComponent instanceof JPAListViewComponent) {
                            Class type = listViewComponent.getModelType();
                            new EditorController(stack, path + "/" + step, listViewComponent, JPAHelper.find(type, ReflectionHelper.toId(type, step))).next(stack, path, step, remaining);
                        } else {
                            Object o = MateuUI.get().getPendingResult();
                            MateuUI.get().setPendingResult(null);
                            if (o == null) ((RpcListViewComponent) listViewComponent).onEdit(step);
                            if (o instanceof RpcView) new ListViewComponentController(stack, path + "/" + step, new RpcListViewComponent((RpcView) o)).next(stack, path, step, remaining);
                            else if (!(o instanceof Component)) new EditorController(stack, path + "/" + step, o).next(stack, path, step, remaining);
                        }

                    }

                }
            } else {

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
                    new MethodController(stack, path + "/" + step, editorViewComponent.getModel(), method).next(stack, path, step, remaining);
                } else if (field != null) {
                    if (step.endsWith("_search")) new FieldController(stack, path + "/" + step, field, editorViewComponent).next(stack, path, step, remaining);
                    else new FieldController(stack, path + "/" + step, field, editorViewComponent).next(stack, path, step, remaining);

                }

            }
        }


    }
}
