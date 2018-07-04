package io.mateu.mdd.core;

import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.views.RPCView;

import java.lang.reflect.Method;

public interface MDDPort {

    void alert(String msg);

    void openCRUD(AbstractAction action, Class entityClass, String queryFilters, boolean modifierPressed);

    void openEditor(AbstractAction action, Class viewClass, Object id, boolean modifierPressed);

    UserData getUserData();

    void openView(RPCView v, boolean modifierPressed);

    void alert(Throwable throwable);

    void setUserData(UserData userData);

    void openPrivateAreaSelector();

    void open(AbstractArea a);

    void open(MenuEntry m);

    void open(AbstractModule m);

    void open(Method m);

    void open(FieldInterfaced f);
}
