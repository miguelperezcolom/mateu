package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.shared.ERPService;

public class MDD {

    public static void openCRUD(Class entityClass) {
        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), entityClass, new MDDCallback());
    }

    public static void openEditor(Class entityClass, Object id) {
        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), entityClass, new Callback<Data>() {
            @Override
            public void onSuccess(Data result) {
                MateuUI.openView(new MDDJPACRUDView(result).getNewEditorView().setInitialId(id));
            }
        });
    }


}
