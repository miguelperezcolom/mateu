package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import io.mateu.mdd.vaadinport.vaadin.components.oldviews.CRUDViewComponent;

public class CrudViewFlowComponent extends AbstractFlowComponent {

    private final CRUDViewComponent crudViewComponent;
    private final String state;

    @Override
    public String getViewTile() {
        return crudViewComponent.getViewTitle();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public CrudViewFlowComponent(String state, CRUDViewComponent crudViewComponent) {
        this.state = state;
        this.crudViewComponent = crudViewComponent;

        crudViewComponent.addViewListener(t -> flowViewListeners.forEach(l -> l.titleChanged(t)));


        addStyleName("viewflowcomponent");

        addComponent(crudViewComponent.getListViewComponent());
    }


    public CRUDViewComponent getCrudViewComponent() {
        return crudViewComponent;
    }
}
