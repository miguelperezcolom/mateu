package com.vaadin.server;

import com.vaadin.client.MouseOverVerticalLayoutRpc;
import com.vaadin.shared.MouseOverVerticalLayoutState;
import com.vaadin.ui.VerticalLayout;

public class MouseOverVerticalLayout extends VerticalLayout implements MouseOverVerticalLayoutRpc {

    @Override
    protected MouseOverVerticalLayoutState getState() {
        return (MouseOverVerticalLayoutState) super.getState();
    }


    public MouseOverVerticalLayout() {
        super();

        registerRpc(this);
    }

    @Override
    public void mousedOver() {
        System.out.println("moused over!!!!!!!");
    }
}
