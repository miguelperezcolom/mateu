package io.mateu.mdd.core.app;


import io.mateu.mdd.core.interfaces.WizardPage;

import java.util.function.Supplier;

public class MDDOpenWizardAction extends AbstractAction {

    public final Supplier<WizardPage> firstPageSupplier;

    public MDDOpenWizardAction(String name, Supplier<WizardPage> firstWizardPageSupplier) {
        super(name);
        this.firstPageSupplier = firstWizardPageSupplier;
    }

}
