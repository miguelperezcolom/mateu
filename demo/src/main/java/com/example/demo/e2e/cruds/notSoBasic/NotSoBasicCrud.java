package com.example.demo.e2e.cruds.notSoBasic;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class NotSoBasicCrud implements RpcCrudView<SearchForm, Row, ReadOnlyView> {

    private final Service service = new Service();

    @Override
    public List<Row> rpc(SearchForm filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return service.rpc(filters, sortOrders, offset, limit);
    }

    @Override
    public int gatherCount(SearchForm filters) throws Throwable {
        return service.gatherCount(filters);
    }
}
