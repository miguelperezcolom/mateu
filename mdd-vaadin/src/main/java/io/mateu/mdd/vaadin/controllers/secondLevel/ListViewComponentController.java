package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.vaadin.components.app.views.secondLevel.FiltersViewFlowComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.JPAListViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.JPAHelper;

import java.lang.reflect.Method;

public class ListViewComponentController extends Controller {

    private final ListViewComponent listViewComponent;

    public ListViewComponentController(ViewStack stack, String path, ListViewComponent listViewComponent) {
        this.listViewComponent = listViewComponent;
        register(stack, path, listViewComponent);
    }


    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {

        if (!"".equals(cleanStep)) {
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
                    new MethodController(stack, path + "/" + step, method).apply(stack, path, step, cleanStep, remaining);
                } else {
                    if (listViewComponent instanceof JPAListViewComponent) {
                        Class type = listViewComponent.getModelType();
                        new EditorController(stack, path + "/" + step, listViewComponent, JPAHelper.find(type, ReflectionHelper.toId(type, step))).next(stack, path, step, remaining);
                    } else if (listViewComponent instanceof RpcListViewComponent) {
                        Object o = null;
                        if (MDDUIAccessor.getPendingResult() != null) {
                            o = MDDUIAccessor.getPendingResult();
                            MDDUIAccessor.setPendingResult(null);
                        } else o = ((RpcListViewComponent) listViewComponent).onEdit(step);

                        if (o != null) {
                            if (o instanceof RpcView) register(stack, path + "/" + step, new RpcListViewComponent((RpcView) o));
                            else if (!(o instanceof Component)) {
                                if (o instanceof PersistentPojo) new EditorController(stack, path + "/" + step, listViewComponent, o).next(stack, path, step, remaining);
                                if (o instanceof ReadOnlyPojo) new ReadOnlyController(stack, path + "/" + step, listViewComponent, o).next(stack, path, step, remaining);
                                else new EditorController(stack, path + "/" + step, listViewComponent, o).next(stack, path, step, remaining);
                            } else register(stack, path + "/" + step, (Component) o);
                        } else {

                            Class type = listViewComponent.getModelType();
                            if (PersistentPojo.class.isAssignableFrom(type)) {
                                PersistentPojo o2 = (PersistentPojo) ReflectionHelper.newInstance(type);
                                o2.load(step);
                                new EditorController(stack, path + "/" + step, listViewComponent, o2).next(stack, path, step, remaining);
                            } else if (ReadOnlyPojo.class.isAssignableFrom(type)) {
                                ReadOnlyPojo o2 = (ReadOnlyPojo) ReflectionHelper.newInstance(type);
                                o2.load(step);
                                new ReadOnlyController(stack, path + "/" + step, listViewComponent, o2).next(stack, path, step, remaining);
                            } else {
                                throw new Exception("" + type + " must be ReadOnlyPojo or PersistentPojo to be loaded");
                            }

                        }

                    }

                }

            }
        }

    }
}
