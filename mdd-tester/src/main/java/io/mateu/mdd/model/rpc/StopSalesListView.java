package io.mateu.mdd.model.rpc;


import io.mateu.ui.mdd.server.interfaces.CompositeView;
import lombok.Getter;
import lombok.Setter;

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
