package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.views.AbstractCRUDView;
import io.mateu.ui.core.shared.AsyncCallback;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.shared.ERPService;

import java.util.List;

/**
 * Created by miguel on 11/1/17.
 */
public abstract class JPACRUDView extends AbstractCRUDView {

    public abstract String getEntityClassName();

    @Override
    public void rpc(Data parameters, AsyncCallback<Data> callback) {
        parameters.set("_sql", getSql());
        parameters.set("_rowsperpage", 3000);
        ERPServiceAsync s = MateuUI.create(ERPService.class);
        s.selectPaginated(parameters, callback);
    }


    @Override
    public void delete(List<Data> list, AsyncCallback<Void> asyncCallback) {
        ERPServiceAsync s = MateuUI.create(ERPService.class);
        s.executeUpdate(getDeleteJpql(list), new Callback<Integer>() {
            @Override
            public void onSuccess(Integer result) {
                asyncCallback.onSuccess(null);
            }

            @Override
            public void onFailure(Throwable caught) {
                asyncCallback.onFailure(caught);
            }
        });
    }

    private String getDeleteJpql(List<Data> list) {
        String s = "delete from " + getEntityClassName() + " x where x.id in (";

        boolean first = true;
        for (Data d : list) {

            if (first) first = false;
            else s += ",";

            s += d.get("_id");
        }


        s += ")";

        return s;
    }
}
