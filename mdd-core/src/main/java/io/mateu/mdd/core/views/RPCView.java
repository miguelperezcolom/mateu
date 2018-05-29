package io.mateu.mdd.core.views;

import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.GridData;
import io.mateu.mdd.core.data.UserData;

public interface RPCView<T, S> {

    GridData rpc() throws Throwable;

    default Data get(UserData user, Object id) throws Throwable {
        return null;
    }

    default String getViewTitle() {
        return null;
    }

}
