package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.EditorViewComponent;

public class EditorViewFlowComponent extends VerticalLayout implements FlowViewComponent {

    private final EditorViewComponent editorViewComponent;
    private final String state;

    @Override
    public String getViewTile() {
        return editorViewComponent.getViewTitle();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public EditorViewFlowComponent(String state, EditorViewComponent editorViewComponent) {
        this.state = state;
        this.editorViewComponent = editorViewComponent;

        addStyleName("editorflowcomponent");

        addComponent(editorViewComponent);

    }

}
