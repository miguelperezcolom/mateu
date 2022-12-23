package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;

public class WizardController extends EditorController {
    public WizardController(WizardPage firstPage) {
        super((EditorViewComponent) MDDViewComponentCreator.createComponent(firstPage));
    }
}
