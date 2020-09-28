package io.mateu.mdd.core.app;


public class MDDOpenWizardAction extends AbstractAction {

    public final Class firstPageClass;

    public MDDOpenWizardAction(String name, Class firstWizardPageClass) {
        super(name);
        this.firstPageClass = firstWizardPageClass;
    }

}
