package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;

public class FieldEditorComponent extends VerticalLayout {

    private final FieldInterfaced field;

    @Override
    public String toString() {
        return "Editing field " + Helper.capitalize(field.getName());
    }

    public FieldEditorComponent(FieldInterfaced field) {

        this.field = field;

        addStyleName("methodresultflowcomponent");

        addComponent(new Label("Pendiente"));
        addComponentsAndExpand(new Label(""));


    }

}
