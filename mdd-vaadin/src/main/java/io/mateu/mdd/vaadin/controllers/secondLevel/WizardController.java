package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class WizardController extends EditorController {
    public WizardController(ViewStack stack, String path, WizardPage firstPage) {
        super(stack, path, (EditorViewComponent) MDDViewComponentCreator.createComponent(firstPage));
    }
}
