package org.example.application.ui.wizards;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.interfaces.WizardPage;
import lombok.Getter;
import lombok.Setter;
import org.example.application.ui.wizards.WizardPage2;

@MateuUI(path = "/wizard")
@Getter@Setter
public class WizardPage1 implements WizardPage {

    String name;

    int age;



    @Override
    public WizardPage getPrevious() {
        return null;
    }

    @Override
    public boolean hasNext() {
        return true;
    }

    @Override
    public WizardPage getNext() {
        return new WizardPage2(this);
    }
}
