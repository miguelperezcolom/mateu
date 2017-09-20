package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.components.fields.SqlAutocompleteField;
import io.mateu.ui.core.client.components.fields.SqlComboBoxField;
import io.mateu.ui.core.shared.AsyncCallback;
import io.mateu.ui.mdd.shared.ERPService;

/**
 * Created by miguel on 12/1/17.
 */
public class JPAAutocompleteField extends SqlAutocompleteField {
    private String ql;

    public JPAAutocompleteField(String id) {
        super(id);
    }

    public JPAAutocompleteField(String id, String label) {
        super(id, label);
    }

    public JPAAutocompleteField(String id, String label, String ql) {
        super(id, label); this.ql = ql;
    }

    public String getJpql() {
        return ql;
    }

    public JPAAutocompleteField setQl(String ql) {
        this.ql = ql;
        return this;
    }

    public void call(AsyncCallback<Object[][]> callback) {
        ((ERPServiceAsync)MateuUI.create(ERPService.class)).select(getJpql(),callback);
    }

}
