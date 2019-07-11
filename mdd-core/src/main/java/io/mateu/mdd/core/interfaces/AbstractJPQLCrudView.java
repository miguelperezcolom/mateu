package io.mateu.mdd.core.interfaces;

import com.vaadin.data.provider.QuerySortOrder;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

public abstract class AbstractJPQLCrudView<R, T> extends AbstractJPQLListView<R> implements RpcCrudView<AbstractJPQLListView, R, T> {

    @Override
    public boolean isAddEnabled() {
        return true;
    }

    @Override
    public Query buildQuery(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) throws Throwable {
        return buildFilteredQueryFromEntityClass(em, sortOrders, forCount);
    }


}
