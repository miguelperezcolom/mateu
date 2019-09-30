package com.vaadin.client;

import com.google.gwt.event.dom.client.MouseOverEvent;
import com.google.gwt.event.dom.client.MouseOverHandler;
import com.vaadin.client.ui.VVerticalLayout;

public class VMouseOverVerticalLayout extends VVerticalLayout implements MouseOverHandler {

    private MouseOverVerticalLayoutRpc rpc;

    public void setRpc(MouseOverVerticalLayoutRpc rpc) {
        this.rpc = rpc;
    }

    @Override
    public void onMouseOver(MouseOverEvent mouseOverEvent) {

        System.out.println("mouseover!!!!");

        getWidget(0).addStyleName("warning");

        rpc.mousedOver();

    }
}
