package io.mateu.mdd.model.rpc;

import io.mateu.erp.model.util.Helper;
import io.mateu.erp.model.util.JPATransaction;
import io.mateu.ui.core.client.views.ListView;
import io.mateu.ui.core.client.views.RPCView;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.GridData;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.interfaces.CompositeView;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter@Setter
public class StopSalesListView implements CompositeView<Hotel, StopSalesView> {

    @Override
    public String getViewTitle() {
        return "Stop sales";
    }

    @Override
    public String getParams() {
        return "name";
    }


    @Override
    public String getCols() {
        return "id, name";
    }

    @Override
    public String getColHeaders() {
        return "Hotel name";
    }

    @Override
    public String getActionName() {
        return "Open stop sales";
    }
}
