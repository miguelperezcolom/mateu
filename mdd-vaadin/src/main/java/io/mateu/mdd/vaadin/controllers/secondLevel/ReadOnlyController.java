package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.ReadOnlyViewComponent;
import io.mateu.mdd.vaadin.navigation.ViewStack;

import java.util.List;

public class ReadOnlyController extends EditorController {

    public ReadOnlyController(ReadOnlyViewComponent editorViewComponent) {
        super(editorViewComponent);
    }

    public ReadOnlyController(Object bean) {
        super(bean);
    }

    public ReadOnlyController(MDDOpenEditorAction action) throws Exception {
        super(action);
    }

    public ReadOnlyController(ListViewComponent listViewComponent, Object bean) throws Throwable {
        super(listViewComponent, bean);
    }

    @Override
    protected EditorViewComponent createEditorViewComponent(ListViewComponent listViewComponent, Object bean, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields) {
        return new ReadOnlyViewComponent(listViewComponent, bean, visibleFields, hiddenFields);
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {


        if (!"".equals(step)) {

            if ("edit".equals(cleanStep)) {
                return ((ReadOnlyPojo)getEditorViewComponent().getModel()).getEditor();
            } else {
                return super.apply(stack, path, step, cleanStep, remaining);
            }

        }

        return null;
    }

}
