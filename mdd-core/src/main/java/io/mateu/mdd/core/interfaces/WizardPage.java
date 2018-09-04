package io.mateu.mdd.core.interfaces;

import java.io.IOException;

public interface WizardPage {

    WizardPage getPrevious();

    WizardPage getNext();

    default boolean isValid() {
        return true;
    }

    default void onOk() throws IOException, Throwable {
        System.out.println("wizard done");
    }

}
