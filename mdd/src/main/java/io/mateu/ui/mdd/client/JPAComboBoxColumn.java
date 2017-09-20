package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.components.fields.grids.columns.SqlComboBoxColumn;
import io.mateu.ui.core.shared.AsyncCallback;
import io.mateu.ui.mdd.shared.ERPService;

/**
 * Created by miguel on 12/1/17.
 */
public class JPAComboBoxColumn extends SqlComboBoxColumn {
    private String ql;

    public JPAComboBoxColumn(String id, String label, String ql) {
        super(id, label, 100, null); this.ql = ql;
    }

    public String getJpql() {
        return ql;
    }

    public JPAComboBoxColumn setQl(String ql) {
        this.ql = ql;
        return this;
    }

    public void call(AsyncCallback<Object[][]> callback) {
        ((ERPServiceAsync)MateuUI.create(ERPService.class)).select(getJpql(),callback);
    }

}
