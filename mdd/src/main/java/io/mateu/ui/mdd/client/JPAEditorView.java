package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.views.BaseEditorView;
import io.mateu.ui.core.shared.AsyncCallback;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.shared.ERPService;

/**
 * Created by miguel on 11/1/17.
 */
public abstract class JPAEditorView extends BaseEditorView {

    private final JPACRUDView crud;

    public JPAEditorView(JPACRUDView crud) {
        this.crud = crud;
    }

    public String getEntityClassName() {
        return crud.getEntityClassName();
    }

    @Override
    public String getServerSideControllerKey() {
        return "jpa";
    }

    @Override
    public void save(Data data, AsyncCallback<Data> callback) {
        ERPServiceAsync s = MateuUI.create(ERPService.class);
        s.set(this.getServerSideControllerKey(), getEntityClassName(), data, callback);
    }

    @Override
    public void load(Object id, AsyncCallback<Data> callback) {
        ERPServiceAsync s = MateuUI.create(ERPService.class);
        if (id instanceof Long) s.get(this.getServerSideControllerKey(), getEntityClassName(), (long) id, callback);
        else if (id instanceof Integer) s.get(this.getServerSideControllerKey(), getEntityClassName(), (int) id, callback);
        else if (id instanceof String) s.get(this.getServerSideControllerKey(), getEntityClassName(), (String) id, callback);
        else callback.onFailure(new Throwable("" + ((id != null)?id.getClass().getName():"null object class") + " type is not supported as ID"));
    }

}
