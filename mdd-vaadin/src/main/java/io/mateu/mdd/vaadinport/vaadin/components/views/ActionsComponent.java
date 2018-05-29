package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.Component;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.MenuBar;
import io.mateu.mdd.core.app.AbstractAction;

public class ActionsComponent extends CssLayout {
    private final ViewComponent viewComponent;

    public ActionsComponent(ViewComponent viewComponent) {
        this.viewComponent = viewComponent;

        build();
    }

    private void build() {

        MenuBar bar = new MenuBar();

        viewComponent.addMenuItems(bar);

        addComponent(bar);

    }
}
