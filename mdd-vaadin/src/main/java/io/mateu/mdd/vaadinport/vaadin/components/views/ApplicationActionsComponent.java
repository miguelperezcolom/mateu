package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.CssLayout;
import com.vaadin.ui.MenuBar;

public class ApplicationActionsComponent extends CssLayout {
    private final AbstractViewComponent viewComponent;

    public ApplicationActionsComponent(AbstractViewComponent viewComponent) {
        this.viewComponent = viewComponent;

        build();
    }

    private void build() {

        addStyleName("applicationactions");

        MenuBar bar = new MenuBar();

        viewComponent.addViewActionsMenuItems(bar);

        addComponent(bar);

    }
}
