package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.server.WizardPageVO;

/**
 * Created by miguel on 12/1/17.
 */
public class ServerSideWizardCallback extends Callback<WizardPageVO> {

    private Data initialData = new Data();

    public ServerSideWizardCallback() {

    }

    public ServerSideWizardCallback(Data initialData) {
        this.initialData = initialData;
    }


    @Override
    public void onSuccess(WizardPageVO result) {
        MateuUI.open(new ServerSideWizardView(result) {
            @Override
            public Data initializeData() {
                return initialData;
            }
        } );
    }

}
