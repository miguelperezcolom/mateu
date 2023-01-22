package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.FieldSearch;
import io.mateu.mdd.vaadin.pojos.MethodCall;
import io.mateu.mdd.vaadin.pojos.ModelField;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.reflection.Transferrer;
import io.mateu.util.persistence.JPAHelper;
import io.mateu.util.persistence.JPATransaction;

import javax.persistence.Entity;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

public class EditorController extends Controller {

    private final EditorViewComponent editorViewComponent;

    public EditorController(EditorViewComponent editorViewComponent) {
        this.editorViewComponent = editorViewComponent;
    }

    public EditorController(Object bean) {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(bean);
        if (bean != null && bean.getClass().isAnnotationPresent(MateuUI.class)) editorViewComponent.setIcon(VaadinIcons.FORM);
    }

    public EditorController(MDDOpenEditorAction action) {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(action);
    }

    public EditorController(ListViewComponent listViewComponent, Object bean) throws Throwable {
        if (bean == null) {
            if (PersistentPojo.class.isAssignableFrom(listViewComponent.getModelType())) {
                bean = ReflectionHelper.newInstance(listViewComponent.getModelType());
                ((PersistentPojo) bean).load(ReflectionHelper.getId(bean));
            }
        }
        List<FieldInterfaced> visibleFields = ReflectionHelper.getAllEditableFilteredFields(bean.getClass(), listViewComponent.getEditableFieldsFilter(), null);
        List<FieldInterfaced> hiddenFields = new ArrayList<>();
        editorViewComponent = createEditorViewComponent(listViewComponent, bean, visibleFields, hiddenFields);
    }

    protected EditorViewComponent createEditorViewComponent(ListViewComponent listViewComponent, Object bean, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields) {
        return new EditorViewComponent(listViewComponent, bean, visibleFields, hiddenFields);
    }

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }

    private String getLastStep(String path) {
        String last = path;
        if (last.contains("/")) last = path.substring(path.lastIndexOf("/") + 1);
        return last;
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {


        if (!"".equals(step)) {

            Object model = editorViewComponent.getModel();
            Method method;
            FieldInterfaced field;

            boolean returnAsResult = false;
            if ("submitted".equals(step) && model instanceof Runnable) {
                return new Result("Done");
            } else if ("submitted".equals(step) && model instanceof Callable) {
                return new Result(MDDUIAccessor.getPendingResult());
            } else if ("submitted".equals(step) && model.getClass().isAnnotationPresent(Entity.class)) {
                return new Result("Saved");
            } else if ("submitted".equals(step) && model instanceof PersistentPojo) {
                return new Result("Saved");
            } else if ("submitted".equals(step) && (editorViewComponent.getListViewComponent() != null)) {
                return new Result("Saved");
            } else {
                if (model != null) {
                    method = ReflectionHelper.getMethod(model.getClass(), step);
                } else {
                    method = editorViewComponent.getMethod(step);
                }
            }

            if (method != null) {
                Object result = new MethodCall(model, method, null).process();
                if (returnAsResult) {
                    return new Result(result);
                } else {
                    return result;
                }
            } else {
                if (model != null) {
                    field = ReflectionHelper.getFieldByName(model.getClass(), step.endsWith("_search") ?
                            step.replaceAll("_search", "") : step);
                } else {
                    field = editorViewComponent.getField(step);
                }
                if (step.endsWith("_search")) {
                    return new FieldSearch(model, field);
                }
                return new ModelField(model, field);
            }

        }
        return null;

    }


}
