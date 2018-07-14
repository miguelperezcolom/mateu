package io.mateu.mdd.vaadinport.vaadin.components.app.flow;

import com.vaadin.ui.Component;

public interface FlowViewComponent extends Component {

    String getViewTile();

    String getStatePath();

    void addFlowViewListener(FlowViewListener listener);
}
