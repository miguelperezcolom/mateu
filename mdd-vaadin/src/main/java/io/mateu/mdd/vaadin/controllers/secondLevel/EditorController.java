package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.thirdLevel.FieldController;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;

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

    public EditorController(ViewStack stack, String path, ListViewComponent listViewComponent, Object bean) {
        List<FieldInterfaced> visibleFields = ReflectionHelper.getAllEditableFilteredFields(bean.getClass(), listViewComponent.getEditableFieldsFilter(), null);
        List<FieldInterfaced> hiddenFields = new ArrayList<>();
        editorViewComponent = new EditorViewComponent(listViewComponent, bean, visibleFields, hiddenFields);
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

                if (step.endsWith("_search")) new FieldController(stack, path + "/" + step, field, editorViewComponent).next(stack, path, step, remaining);
                else new FieldController(stack, path + "/" + step, field, editorViewComponent).next(stack, path, step, remaining);

            }

        }

    }


}
