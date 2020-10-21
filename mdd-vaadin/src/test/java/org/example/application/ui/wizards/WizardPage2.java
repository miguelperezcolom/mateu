package org.example.application.ui.wizards;

import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.util.notification.Notifier;
import lombok.Getter;
import lombok.Setter;
import org.example.application.ui.wizards.WizardPage1;

@Getter
@Setter
public class WizardPage2 implements WizardPage {
    @Ignored
    private final WizardPage1 page1;


    private String surname;

    private String city;


    public WizardPage2(WizardPage1 page1) {
        this.page1 = page1;
    }

    @Override
    public WizardPage getPrevious() {
        return page1;
    }

    @Override
    public boolean hasNext() {
        return false;
    }

    @Override
    public void onOk() throws Throwable {
        Notifier.alert("Done");
    }

    @Override
    public WizardPage getNext() {
        return null;
    }
}
