package com.vaadin.server;

import com.vaadin.client.MouseOverVerticalLayoutRpc;
import com.vaadin.ui.VerticalLayout;

public abstract class MouseOverVerticalLayout extends VerticalLayout implements MouseOverVerticalLayoutRpc {

    public MouseOverVerticalLayout() {
        super();

        registerRpc(this);
    }

    @Override
    public abstract void mousedOver();
}
