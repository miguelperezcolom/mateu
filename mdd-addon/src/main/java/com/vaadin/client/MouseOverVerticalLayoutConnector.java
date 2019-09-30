package com.vaadin.client;

import com.google.gwt.event.dom.client.MouseOverEvent;
import com.google.gwt.event.dom.client.MouseOverHandler;
import com.vaadin.client.communication.RpcProxy;
import com.vaadin.client.ui.orderedlayout.VerticalLayoutConnector;
import com.vaadin.server.MouseOverVerticalLayout;
import com.vaadin.shared.ui.Connect;

@Connect(MouseOverVerticalLayout.class)
public class MouseOverVerticalLayoutConnector extends VerticalLayoutConnector implements MouseOverHandler {


    static native void console(String text)
        /*-{
            console.log(text);
         }-*/;

    MouseOverVerticalLayoutRpc rpc = RpcProxy.create(MouseOverVerticalLayoutRpc.class, this);

    @Override
    public VMouseOverVerticalLayout getWidget() {
        return (VMouseOverVerticalLayout) super.getWidget();
    }


    public MouseOverVerticalLayoutConnector() {
        //console(getWidget().getStyleName());
        getWidget().addStyleName("mouseoveractivo");
        getWidget().addDomHandler(this, MouseOverEvent.getType());
    }

    @Override
    public void onMouseOver(MouseOverEvent mouseOverEvent) {
        //console(getWidget().getStyleName());
        if (getWidget().getStyleName().contains("mouseoveractivo")) {
            rpc.mousedOver();
        }
    }
}
