package com.vaadin.shared;

import com.vaadin.shared.ui.orderedlayout.VerticalLayoutState;

public class MouseOverVerticalLayoutState extends VerticalLayoutState {

    private boolean mousedOver;

    public boolean isMousedOver() {
        return mousedOver;
    }

    public void setMousedOver(boolean mousedOver) {
        this.mousedOver = mousedOver;
    }
}
