package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.app.MDDOpenCustomComponentAction;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class CustomComponentController extends Controller {
    public CustomComponentController(ViewStack stack, String path, MDDOpenCustomComponentAction action) {
        registerComponentInStack(stack, path, new ComponentWrapper(action.getIcon(), action.getCaption(), action.getComponent(), false));
    }

}
