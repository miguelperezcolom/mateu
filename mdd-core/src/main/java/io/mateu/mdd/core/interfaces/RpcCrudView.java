package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.RpcView;

public interface RpcCrudView<F, C, T> extends RpcView<F, C> {

    Object deserializeId(String sid);

    boolean isAddEnabled();
}
