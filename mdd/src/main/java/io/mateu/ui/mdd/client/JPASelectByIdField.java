package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.components.fields.SelectByIdField;
import io.mateu.ui.core.client.components.fields.SqlComboBoxField;
import io.mateu.ui.core.shared.AsyncCallback;
import io.mateu.ui.mdd.shared.ERPService;

/**
 * Created by miguel on 12/1/17.
 */
public abstract class JPASelectByIdField extends SelectByIdField {

    public JPASelectByIdField(String id, String ql) {
        super(id, ql);
    }

    public JPASelectByIdField(String id, String label, String ql) {
        super(id, label, ql);
    }

    public JPASelectByIdField setQl(String ql) {
        super.setQl(ql);
        return this;
    }

    public void call(String ql, AsyncCallback<Object[][]> callback) {
        ((ERPServiceAsync)MateuUI.create(ERPService.class)).select(ql,callback);
    }

}
