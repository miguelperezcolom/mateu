package io.mateu.mdd.vaadin.views;

import com.vaadin.ui.Component;
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


        if (model instanceof Component) {
            return new ComponentView(stack, Helper.capitalize(step), null, model);
        }
    }

}
