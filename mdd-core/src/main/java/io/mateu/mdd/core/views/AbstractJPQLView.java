package io.mateu.mdd.core.views;

import io.mateu.mdd.core.data.GridData;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.data.UserData;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public abstract class AbstractJPQLView<S, T> implements RpcView<S, T> {

    public abstract Query buildQuery(EntityManager em, UserData user, S parameters);

    @Override
    public GridData<T> rpc(EntityManager em, UserData user, S parameters) {

        return null;
    }
}
