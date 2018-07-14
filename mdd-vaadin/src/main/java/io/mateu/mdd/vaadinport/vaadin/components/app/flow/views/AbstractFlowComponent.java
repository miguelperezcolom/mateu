package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewListener;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractFlowComponent extends VerticalLayout implements FlowViewComponent {

    List<FlowViewListener> flowViewListeners = new ArrayList<>();

    @Override
    public void addFlowViewListener(FlowViewListener listener) {
        flowViewListeners.add(listener);
    }

}
