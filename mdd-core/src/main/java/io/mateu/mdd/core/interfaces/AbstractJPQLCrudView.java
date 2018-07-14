package io.mateu.mdd.core.interfaces;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public abstract class AbstractJPQLCrudView<R, T> extends AbstractJPQLListView<R> implements RpcCrudView<AbstractJPQLListView, R, T> {

    @Override
    public boolean isAddEnabled() {
        return true;
    }

}
