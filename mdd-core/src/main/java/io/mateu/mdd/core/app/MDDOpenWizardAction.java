package io.mateu.mdd.core.app;


import io.mateu.mdd.core.interfaces.WizardPage;

public class MDDOpenWizardAction extends AbstractAction {

    public final WizardPage firstPage;

    public MDDOpenWizardAction(String name, WizardPage firstWizardPage) {
        super(name);
        this.firstPage = firstWizardPage;
    }

}
