package io.mateu.mdd.vaadin.views;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.util.Helper;

public class ViewMapper {

    private final ViewStack stack;

    public ViewMapper(ViewStack stack) {
        this.stack = stack;
    }

    public View toView(Object model, String step) {
        if (model == null) {
            return new BrokenLinkView(stack);
        }
        if (model instanceof AbstractMenu) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    new MenuComponent((AbstractMenu) model));
        }
        if (model instanceof AbstractModule) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    new FakeComponent("Module " + ((AbstractModule) model).getName()));
        }


        if (model instanceof Component) {
            return new ComponentView(stack, Helper.capitalize(step), null,
                    (Component) model);
        }
    }

}
