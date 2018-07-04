package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.CRUDViewComponent;

public class ViewFlowComponent extends VerticalLayout implements FlowViewComponent {

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


    public ViewFlowComponent(String state, CRUDViewComponent crudViewComponent) {
        this.state = state;
        this.crudViewComponent = crudViewComponent;

        addStyleName("viewflowcomponent");

        addComponent(crudViewComponent.getListViewComponent());
    }


    public CRUDViewComponent getCrudViewComponent() {
        return crudViewComponent;
    }
}
