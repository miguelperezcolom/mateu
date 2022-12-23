package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.app.MDDOpenCustomComponentAction;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class CustomComponentController extends Controller {
    private final MDDOpenCustomComponentAction action;

    public CustomComponentController(MDDOpenCustomComponentAction action) {
        this.action = action;
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        return new ComponentWrapper(action.getIcon(), action.getCaption(), action.getComponent(), false);
    }
}
