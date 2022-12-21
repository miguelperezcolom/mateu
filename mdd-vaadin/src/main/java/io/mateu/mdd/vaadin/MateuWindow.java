package io.mateu.mdd.vaadin;

import com.vaadin.ui.Window;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.OwnedCollectionComponent;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.util.VaadinHelper;

import javax.persistence.Entity;

public class MateuWindow extends Window {


    private final ViewStack stack;
    private final MateuUI ui;

    public MateuWindow(MateuUI ui, ViewStack stack, String caption) {
        super(caption);
        this.ui = ui;
        this.stack = stack;
    }

    @Override
    public void close() {
        if (!"noback".equals(getData())) {
            if (stack.getLast() != null
                    && !(stack.getLast().getComponent() instanceof OwnedCollectionComponent)
                    && stack.getLast().getComponent() instanceof EditorViewComponent
                    && ((PersistentPojo.class.isAssignableFrom(((EditorViewComponent)stack.getLast()
                        .getComponent()).getModelType())
                    || ((EditorViewComponent)stack.getLast().getComponent()).getModelType()
                        .isAnnotationPresent(Entity.class))
                    && ((EditorViewComponent)stack.getLast().getComponent()).isModificado())
                    && ((EditorViewComponent)stack.getLast().getComponent()).isCreateSaveButton()) {
                VaadinHelper.saveOrDiscard("There are unsaved changes. What do you want to do?",
                        (EditorViewComponent) stack.getLast().getComponent(), () -> yesGoBack());
            } else {
                yesGoBack();
            }
        } else super.close();
    }

    private void yesGoBack() {
        ui.yesGoBack();
        super.close();
    }
}
