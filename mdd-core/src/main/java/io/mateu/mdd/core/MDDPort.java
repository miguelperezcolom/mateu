package io.mateu.mdd.core;

import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.views.RPCView;

public interface MDDPort {

    void alert(String msg);

    void openCRUD(Class entityClass, String queryFilters, boolean modifierPressed);

    void openEditor(Object object, boolean modifierPressed);

    UserData getUserData();

    void openView(RPCView v, boolean modifierPressed);

    void alert(Throwable throwable);
}
