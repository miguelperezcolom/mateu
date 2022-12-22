package io.mateu.mdd.vaadin.views;

import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ViewMapper {

    private final ViewStack stack;

    public ViewMapper(ViewStack stack) {
        this.stack = stack;
    }

    public View toView(Object model) {
        if (model == null) {
            return new BrokenLinkView(stack);
        }

    }

}
