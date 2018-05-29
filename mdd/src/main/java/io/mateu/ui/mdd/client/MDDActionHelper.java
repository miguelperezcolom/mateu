package io.mateu.ui.mdd.client;

import io.mateu.mdd.core.data.Data;

/**
 * Created by miguel on 22/2/17.
 */
public interface MDDActionHelper {
    void onSuccess(Object result);

    void complete(Data parameters);
}
