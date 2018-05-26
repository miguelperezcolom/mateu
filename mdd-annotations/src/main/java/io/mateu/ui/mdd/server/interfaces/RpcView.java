package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.GridData;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public interface RpcView<T, S> {

    GridData<S> rpc(EntityManager em, UserData user, T parameters);

}
