package io.mateu.mdd.core.app;


public class MDDOpenWizardAction extends AbstractAction {

    private final Class firstPageClass;

    public MDDOpenWizardAction(String name, Class firstWizardPageClass) {
        super(name);
        this.firstPageClass = firstWizardPageClass;
    }

    @Override
    public void run(MDDExecutionContext context) {
        context.openWizardPage(firstPageClass);
    }
}
