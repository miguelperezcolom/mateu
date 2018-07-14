package io.mateu.mdd.vaadinport.vaadin.tests.reflection;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public class MiJPQLListViewCaso2 extends SubclaseAbstractJPQLListView<MiJPQLListViewCaso2.Row> {

    @Override
    public Query buildQuery(EntityManager em, boolean forCount) {
        return null;
    }

    @Override
    public Class getRowClass() {
        return null;
    }

    class Row {

    }
}
