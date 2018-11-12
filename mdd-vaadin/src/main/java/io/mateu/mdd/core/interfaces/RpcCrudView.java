package io.mateu.mdd.core.interfaces;

public interface RpcCrudView<F, C, T> extends RpcView<F, C> {

    Object deserializeId(String sid);

    boolean isAddEnabled();
}
