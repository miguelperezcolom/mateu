package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;

public class AreaFlowComponent extends VerticalLayout implements FlowViewComponent {

    private final AbstractArea area;
    private final String state;

    @Override
    public String getViewTile() {
        return area.getName();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public AreaFlowComponent(String state, AbstractArea area) {
        this.state = state;
        this.area = area;

        addStyleName("areaflowcomponent");


        area.getModules().forEach(m -> addComponent(new Button(m.getName(), e -> MDD.open(m))));


    }

}
