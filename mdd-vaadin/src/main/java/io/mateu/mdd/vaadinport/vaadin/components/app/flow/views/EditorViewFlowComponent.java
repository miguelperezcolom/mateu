package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;

public class EditorViewFlowComponent extends AbstractFlowComponent {

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

        editorViewComponent.addViewListener(t -> flowViewListeners.forEach(l -> l.titleChanged(t)));

        addStyleName("editorflowcomponent");

        addComponent(editorViewComponent);


    }

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }
}
