package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.components.fields.SqlComboBoxField;
import io.mateu.mdd.core.data.AsyncCallback;
import io.mateu.ui.mdd.shared.ERPService;

/**
 * Created by miguel on 12/1/17.
 */
public class JPAComboBoxField  extends SqlComboBoxField {
    private String ql;

    public JPAComboBoxField(String id) {
        super(id);
    }

    public JPAComboBoxField(String id, String label) {
        super(id, label);
    }

    public JPAComboBoxField(String id, String label, String ql) {
        super(id, label); this.ql = ql;
    }

    public String getJpql() {
        return ql;
    }

    public JPAComboBoxField setQl(String ql) {
        this.ql = ql;
        return this;
    }

    public void call(AsyncCallback<Object[][]> callback) {
        ((ERPServiceAsync)MateuUI.create(ERPService.class)).select(getJpql(),callback);
    }

}
