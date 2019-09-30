package com.vaadin.client;

import com.vaadin.client.communication.StateChangeEvent;
import com.vaadin.client.ui.VVerticalLayout;
import com.vaadin.client.ui.orderedlayout.VerticalLayoutConnector;
import com.vaadin.server.MouseOverVerticalLayout;
import com.vaadin.shared.MouseOverVerticalLayoutState;
import com.vaadin.shared.ui.Connect;

@Connect(MouseOverVerticalLayout.class)
public class MouseOverVerticalLayoutConnector extends VerticalLayoutConnector {

    @Override
    public VMouseOverVerticalLayout getWidget() {
        return (VMouseOverVerticalLayout) super.getWidget();
    }

    @Override
    public MouseOverVerticalLayoutState getState() {
        return (MouseOverVerticalLayoutState) super.getState();
    }

    @Override
    public void onStateChanged(StateChangeEvent stateChangeEvent) {
        super.onStateChanged(stateChangeEvent);

        if (getState().isMousedOver()) {
            getState().setMousedOver(false);
            getRpcProxy(MouseOverVerticalLayoutRpc.class).mousedOver();
        }
    }
}
