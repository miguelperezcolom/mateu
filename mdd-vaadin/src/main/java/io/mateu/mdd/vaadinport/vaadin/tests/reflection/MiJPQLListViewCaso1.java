package io.mateu.mdd.vaadinport.vaadin.tests.reflection;

import io.mateu.mdd.core.interfaces.AbstractJPQLListView;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

public class MiJPQLListViewCaso1 extends SubclaseAbstractJPQLListView {
    @Override
    public Query buildQuery(EntityManager em, boolean forCount) {
        return null;
    }

    @Override
    public Class getRowClass() {
        return null;
    }

    @Override
    public List rpc(Object filters, int offset, int limit) {
        return null;
    }

    @Override
    public int gatherCount(Object filters) {
        return 0;
    }
}
