package com.example.demo.e2e.cruds.basic;

import com.example.demo.e2e.dtos.SamplePojo;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;

import java.util.List;

public class BasicCrud implements RpcCrudView<SamplePojo, SamplePojo, SamplePojo> {

    private final Service service = new Service();

    @Override
    public List<SamplePojo> rpc(SamplePojo filters, List<QuerySortOrder> sortOrders, int offset, int limit) {
        return service.rpc(filters, sortOrders, offset, limit);
    }

    @Override
    public int gatherCount(SamplePojo filters) throws Throwable {
        return service.gatherCount(filters);
    }

    @Override
    public void save(SamplePojo value) throws Throwable {

    }
}
