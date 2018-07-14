package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;

public class PublicMenuFlowComponent extends AbstractFlowComponent {

    private final String state;

    @Override
    public String getViewTile() {
        return MDD.getApp().getName();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public PublicMenuFlowComponent(String state) {
        this.state = state;

        addStyleName("publicmenuflowcomponent");

        MDD.getApp().getAreas().forEach(a -> addComponent(new Button(a.getName(), e -> MDD.open(a))));

    }

}
