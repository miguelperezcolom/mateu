package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.data.GridData;
import io.mateu.mdd.core.data.UserData;

import javax.persistence.EntityManager;

public interface RpcView<T, S> {

    GridData<S> rpc(EntityManager em, UserData user, T parameters);

}
