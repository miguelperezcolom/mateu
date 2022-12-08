package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.ReadOnlyViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.thirdLevel.FieldController;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class ReadOnlyController extends EditorController {

    public ReadOnlyController(ViewStack stack, String path, ReadOnlyViewComponent editorViewComponent) {
        super(stack, path, editorViewComponent);
    }

    public ReadOnlyController(ViewStack stack, String path, Object bean) {
        super(stack, path, bean);
    }

    public ReadOnlyController(ViewStack stack, String path, MDDOpenEditorAction action) throws Exception {
        super(stack, path, action);
    }

    public ReadOnlyController(ViewStack stack, String path, ListViewComponent listViewComponent, Object bean) throws Throwable {
        super(stack, path, listViewComponent, bean);
    }

    @Override
    protected EditorViewComponent createEditorViewComponent(ListViewComponent listViewComponent, Object bean, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields) {
        return new ReadOnlyViewComponent(listViewComponent, bean, visibleFields, hiddenFields);
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {


        if (!"".equals(step)) {

            if ("edit".equals(cleanStep)) {
                Object model = ((ReadOnlyPojo)getEditorViewComponent().getModel()).getEditor();
                EditorViewComponent editor = new EditorViewComponent(getEditorViewComponent().getListViewComponent(), getEditorViewComponent().getListViewComponent().getModelType());
                editor.setModel(model);
                new EditorController(stack, path + "/" + step, editor).next(stack, path, step, remaining);
                //MDDUIAccessor.setPendingResult(editor);
            } else {
                super.apply(stack, path, step, cleanStep, remaining);
            }

        }

    }

}
