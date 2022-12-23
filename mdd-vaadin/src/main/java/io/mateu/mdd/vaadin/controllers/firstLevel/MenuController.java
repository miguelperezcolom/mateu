package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.controllers.secondLevel.ActionController;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class MenuController extends ActionController {
    private final AbstractMenu menu;

    public MenuController(AbstractMenu menu) {
        this.menu = menu;
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if ("".equals(step)) {
            return menu;
        }
        return super.apply(stack, path, step, cleanStep, remaining);
    }

}
