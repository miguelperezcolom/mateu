package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.shared.ERPService;

public class MDD {

    public static void openCRUD(Class entityClass, boolean modifierPressed) {
        openCRUD(entityClass, entityClass, null, modifierPressed);
    }

    public static void openCRUD(Class entityClass, Class viewClass, String queryFilters, boolean modifierPressed) {
        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), entityClass.getName(), viewClass.getName(), queryFilters, new MDDCallback(modifierPressed));
    }

    public static void openEditor(Class entityClass, Object id, boolean modifierPressed) {
        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), entityClass.getName(), entityClass.getName(), null, new Callback<Data>() {
            @Override
            public void onSuccess(Data result) {
                MateuUI.openView(new MDDJPACRUDView(result).getNewEditorView().setInitialId(id), modifierPressed);
            }
        });
    }

    public static void openView(Class entityClass, Data data, boolean modifierPressed) {
        openView(entityClass, data, null, modifierPressed);
    }

    public static void openView(Class entityClass, Data data, String queryFilters, boolean modifierPressed) {
        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), entityClass.getName(), entityClass.getName(), queryFilters, new MDDCallback() {
            @Override
            public void onSuccess(Data result) {
                MateuUI.openView(new MDDJPACRUDView(result) {
                    @Override
                    public Data initializeData() {
                        return data;
                    }
                }, modifierPressed);
            }
        });
    }

}
