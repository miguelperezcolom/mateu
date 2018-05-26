package io.mateu.ui.mdd.server;

import io.mateu.ui.core.shared.GridData;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.interfaces.RpcView;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public abstract class AbstractJPQLView<S, T> implements RpcView<S, T> {

    public abstract Query buildQuery(EntityManager em, UserData user, S parameters);

    @Override
    public GridData<T> rpc(EntityManager em, UserData user, S parameters) {

        return null;
    }
}
