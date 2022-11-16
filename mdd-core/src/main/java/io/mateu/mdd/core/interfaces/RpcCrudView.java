package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.RpcView;

import java.util.Set;

public interface RpcCrudView<F, C, T> extends RpcView<F, C> {

    Object deserializeId(String sid);

    default boolean isAddEnabled() {
        return true;
    };

    default boolean isDeleteEnabled() {
        return true;
    }

    void delete(Set<C> selection);

    @Override
    default boolean isEditHandled() {
        return true;
    }
}
