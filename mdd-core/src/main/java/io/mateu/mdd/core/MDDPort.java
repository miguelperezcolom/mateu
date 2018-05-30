package io.mateu.mdd.core;

import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.views.RPCView;

public interface MDDPort {

    void alert(String msg);

    void openCRUD(AbstractAction action, Class entityClass, String queryFilters, boolean modifierPressed);

    void openEditor(AbstractAction action, Class viewClass, Object id, boolean modifierPressed);

    UserData getUserData();

    void openView(RPCView v, boolean modifierPressed);

    void alert(Throwable throwable);
}
