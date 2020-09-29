package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.vaadin.components.app.views.MenuFlowComponent;

public class MenuController extends ActionController {
    private final AbstractMenu menu;

    public MenuController(AbstractMenu menu) {
        super();
        this.menu = menu;
    }


    @Override
    public Component apply(String path, String step, String remaining) throws Exception {
        if ("".equals(step)) {
            return new MenuFlowComponent(menu);
        } else {
            return super.apply(path, step, remaining);
        }
    }
}
