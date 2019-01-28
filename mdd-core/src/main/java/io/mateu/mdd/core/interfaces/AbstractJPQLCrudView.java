package io.mateu.mdd.core.interfaces;

public abstract class AbstractJPQLCrudView<R, T> extends AbstractJPQLListView<R> implements RpcCrudView<AbstractJPQLListView, R, T> {

    @Override
    public boolean isAddEnabled() {
        return true;
    }

}
