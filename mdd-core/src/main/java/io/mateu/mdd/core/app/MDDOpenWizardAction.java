package io.mateu.mdd.core.app;


import io.mateu.mdd.core.MDD;

public class MDDOpenWizardAction extends AbstractAction {

    private final Class firstPageClass;

    public MDDOpenWizardAction(String name, Class firstWizardPageClass) {
        super(name);
        this.firstPageClass = firstWizardPageClass;
    }

    @Override
    public void run() {
        MDD.openWizard(firstPageClass);
    }
}
