package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.controllers.secondLevel.ActionController;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class MenuController extends ActionController {
    private final AbstractMenu menu;

    public MenuController(ViewStack stack, String path, AbstractMenu menu) {
        super(stack, path);
        this.menu = menu;
        register(stack, path, new MenuComponent(menu));
    }

}
