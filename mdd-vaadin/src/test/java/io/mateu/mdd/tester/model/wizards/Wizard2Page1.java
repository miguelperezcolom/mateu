package io.mateu.mdd.tester.model.wizards;

import com.vaadin.data.HasValue;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.interfaces.WizardPage;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class Wizard2Page1 implements WizardPage {

    @Ignored
    private final HasValue hasValue;

    private int value;


    public Wizard2Page1(HasValue hasValue) {
        this.hasValue = hasValue;
        value = (int) hasValue.getValue();
    }

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
        return null;
    }

    @Override
    public void onOk() {
        hasValue.setValue(value);
    }
}
