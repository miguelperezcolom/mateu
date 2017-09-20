package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.shared.Data;

/**
 * Created by miguel on 12/1/17.
 */
public class MDDCallback extends Callback<Data> {

    private Data initialData = new Data();

    public MDDCallback() {

    }

    public MDDCallback(Data initialData) {
        this.initialData = initialData;
    }


    @Override
    public void onSuccess(Data result) {
        MateuUI.openView(new MDDJPACRUDView(result) {
            @Override
            public Data initializeData() {
                return initialData;
            }
        } );
    }

}
