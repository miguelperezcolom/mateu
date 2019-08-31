package io.mateu.mdd.tester.model.wizards;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotEmpty;
import java.io.IOException;

@Getter@Setter@ToString@Slf4j
public class Wizard1Page2 implements WizardPage {

    private String aux;

    @Output
    private String previousValues;

    @Ignored
    private final Wizard1Page1 prev;

    public Wizard1Page2(Wizard1Page1 prev) {
        this.prev = prev;
    }



    @Override
    public WizardPage getPrevious() {
        return prev;
    }

    @Override
    public boolean hasNext() {
        return false;
    }

    @Override
    public WizardPage getNext() {
        return null;
    }


    @Override
    public void onOk() throws Throwable {
        log.debug("" + this);
    }
}
