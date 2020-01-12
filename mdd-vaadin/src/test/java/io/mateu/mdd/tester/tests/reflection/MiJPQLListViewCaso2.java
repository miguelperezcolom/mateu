package io.mateu.mdd.tester.tests.reflection;

import com.vaadin.data.provider.QuerySortOrder;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

public class MiJPQLListViewCaso2 extends SubclaseAbstractJPQLListView<MiJPQLListViewCaso2.Row> {

    @Override
    public Query buildQuery(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) {
        return null;
    }

    @Override
    public Class getRowClass() {
        return null;
    }

    class Row {

    }
}
