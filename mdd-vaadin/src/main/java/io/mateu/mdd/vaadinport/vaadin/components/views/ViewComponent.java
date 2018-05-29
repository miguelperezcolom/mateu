package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.google.common.collect.Lists;
import com.vaadin.ui.Label;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.VerticalLayout;

import java.util.ArrayList;
import java.util.List;

public class ViewComponent extends VerticalLayout {

    public ViewComponent() {
        build();
    }

    private void build() {

        addStyleName("viewcomponent");

        addComponent(new Label("Título vista"));


        addComponent(new ActionsComponent(this));

    }


    public void addMenuItems(MenuBar bar) {

    }
}
