package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;

public class ListViewFlowComponent extends AbstractFlowComponent {

    private final ListViewComponent listViewComponent;
    private final String state;

    @Override
    public String getViewTile() {
        return listViewComponent.getViewTitle();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public ListViewFlowComponent(String state, ListViewComponent listViewComponent) {
        this.state = state;
        this.listViewComponent = listViewComponent;

        listViewComponent.addViewListener(t -> flowViewListeners.forEach(l -> l.titleChanged(t)));


        addStyleName("viewflowcomponent");

        addComponent(listViewComponent);
    }


    public ListViewComponent getListViewComponent() {
        return listViewComponent;
    }
}
