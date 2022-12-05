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
import io.mateu.mdd.vaadin.controllers.thirdLevel.FieldController;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class EditorController extends Controller {

    private final EditorViewComponent editorViewComponent;

    public EditorController(ViewStack stack, String path, EditorViewComponent editorViewComponent) {
        this.editorViewComponent = editorViewComponent;
        register(stack, path, editorViewComponent);
    }

    public EditorController(ViewStack stack, String path, Object bean) {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(bean);
        if (bean != null && bean.getClass().isAnnotationPresent(MateuUI.class)) editorViewComponent.setIcon(VaadinIcons.FORM);
        register(stack, path, editorViewComponent);
    }

    public EditorController(ViewStack stack, String path, MDDOpenEditorAction action) throws Exception {
        editorViewComponent = (EditorViewComponent) MDDViewComponentCreator.createComponent(action);
        register(stack, path, editorViewComponent);
    }

    public EditorController(ViewStack stack, String path, ListViewComponent listViewComponent, Object bean) throws Throwable {
        if (bean == null) {
            if (PersistentPojo.class.isAssignableFrom(listViewComponent.getModelType())) {
                bean = ReflectionHelper.newInstance(listViewComponent.getModelType());
                ((PersistentPojo) bean).load(getLastStep(path));
            }
        }
        List<FieldInterfaced> visibleFields = ReflectionHelper.getAllEditableFilteredFields(bean.getClass(), listViewComponent.getEditableFieldsFilter(), null);
        List<FieldInterfaced> hiddenFields = new ArrayList<>();
        editorViewComponent = new EditorViewComponent(listViewComponent, bean, visibleFields, hiddenFields);
        register(stack, path, editorViewComponent);
    }

    private String getLastStep(String path) {
        String last = path;
        if (last.contains("/")) last = path.substring(path.lastIndexOf("/") + 1);
        return last;
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {


        if (!"".equals(step)) {

            if ("submitted".equals(step) || editorViewComponent.esForm() && step.equals(editorViewComponent._defaultAction)) {
                Object r = MDDUIAccessor.getPendingResult();
                Component c = null;
                if (r == null) {
                    Label h = new Label("Done!");
                    h.addStyleName(ValoTheme.LABEL_H1);
                    r = c = h;
                }
                else if (r instanceof Component) c = (Component) r;
                else {
                    Label h = new Label("" + r);
                    h.addStyleName(ValoTheme.LABEL_H1);
                    c = h;
                }
                AbstractViewComponent cw = c != null?new ComponentWrapper("Form submitted", c):MethodController.procesarResultado(null, r, null, false);
                cw.setTitle("Form submitted");
                register(stack, path + "/" + step, cw);
                MDDUIAccessor.setPendingResult(null);
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
