package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;

public class PrivateMenuFlowComponent extends AbstractFlowComponent {

    private final String state;

    @Override
    public String getViewTile() {
        return "";
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public PrivateMenuFlowComponent(String state) {
        this.state = state;

        addStyleName("privatemenuflowcomponent");

    }


}
