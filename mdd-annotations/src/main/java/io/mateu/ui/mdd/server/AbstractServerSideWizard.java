package io.mateu.ui.mdd.server;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.shared.MDDLink;

/**
 * Created by miguel on 23/4/17.
 */
public abstract class AbstractServerSideWizard {

    public abstract WizardPageVO execute(String action, Data data) throws Throwable;

}
