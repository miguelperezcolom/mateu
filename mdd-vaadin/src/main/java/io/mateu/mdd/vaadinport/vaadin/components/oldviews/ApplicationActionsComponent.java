package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

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

        if (bar.getItems().size() > 0) addComponent(bar);

    }
}
