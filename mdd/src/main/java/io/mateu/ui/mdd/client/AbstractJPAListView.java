package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.views.AbstractSqlListView;
import io.mateu.ui.core.shared.AsyncCallback;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.shared.ERPService;

/**
 * Created by Antonia on 02/04/2017.
 */
public abstract class AbstractJPAListView extends AbstractSqlListView {

    @Override
    public void rpc(Data parameters, AsyncCallback<Data> callback) {
        parameters.set("_sql", this.getSql());
        parameters.set("_rowsperpage", Integer.valueOf(100));
        ERPServiceAsync s = MateuUI.create(ERPService.class);
        s.selectPaginated(parameters, callback);
    }
}
