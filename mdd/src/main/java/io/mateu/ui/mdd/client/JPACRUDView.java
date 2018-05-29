package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.views.AbstractCRUDView;
import io.mateu.mdd.core.data.AsyncCallback;
import io.mateu.mdd.core.data.Data;
import io.mateu.ui.mdd.shared.ERPService;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by miguel on 11/1/17.
 */
public abstract class JPACRUDView extends AbstractCRUDView {

    public abstract String getEntityClassName();

    public abstract String getViewClassName();

    public abstract String getIdFieldName();

    @Override
    public void rpc(Data parameters, AsyncCallback<Data> callback) {
        parameters.set("_sums", getSums());
        parameters.set("_sql", getSql());
        parameters.set("_rowsperpage", 100);
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
        String s = "delete from " + getEntityClassName() + " x where x." + getIdFieldName() + " in (";

        boolean first = true;
        for (Data d : list) {

            if (first) first = false;
            else s += ",";

            Object v = d.get("_id");

            if (v instanceof String) s += "'" + ((String)v).replaceAll("'", "''") + "'";
            else s += v;
        }


        s += ")";

        return s;
    }
}
