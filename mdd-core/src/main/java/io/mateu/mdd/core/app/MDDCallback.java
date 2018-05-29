package io.mateu.mdd.core.app;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.Data;

/**
 * Created by miguel on 12/1/17.
 */
public class MDDCallback extends Callback<Data> {

    private Data initialData = new Data();
    private boolean modifierPressed;

    public MDDCallback() {

    }

    public MDDCallback(boolean modifierPressed) {
        this.modifierPressed = modifierPressed;
    }

    public MDDCallback(Data initialData) {
        this.initialData = initialData;
    }

    public MDDCallback(Data initialData, boolean modifierPressed) {
        this.initialData = initialData;
        this.modifierPressed = modifierPressed;
    }

    @Override
    public void onSuccess(Data result) {
        /*
        RPCView v = new RPCView(result) {
            @Override
            public Data initializeData() {
                return initialData;
            }
        };
        MDD.openView(v, modifierPressed);
        */
    }

}
