package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.views.AbstractWizard;
import io.mateu.ui.core.client.views.AbstractWizardPageView;
import io.mateu.ui.core.client.views.BaseWizard;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.server.WizardPageVO;

/**
 * Created by miguel on 23/4/17.
 */
public class ServerSideWizardView extends AbstractWizard {
    private final WizardPageVO vo;

    public ServerSideWizardView(WizardPageVO vo) {
        this.vo = vo;
    }

    @Override
    public Data getData() {
        return null;
    }

    @Override
    public AbstractWizardPageView execute(Object o, Data data) throws Throwable {
        return null;
    }

    @Override
    public String getTitle() {
        return null;
    }

    @Override
    public void build() {

    }
}
