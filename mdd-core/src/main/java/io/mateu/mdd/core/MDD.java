package io.mateu.mdd.core;

import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.views.RPCView;

public class MDD {

    private static MDDPort port;
    private static BaseMDDApp app;

    public static MDDPort getPort() {
        return port;
    }

    public static void setPort(MDDPort port) {
        MDD.port = port;
    }




    public static void alert(String msg) {
        getPort().alert(msg);
    }

    public static void openCRUD(AbstractAction action, Class entityClass, String queryFilters, boolean modifierPressed) {
        getPort().openCRUD(action, entityClass, queryFilters, modifierPressed);
    }

    public static void openEditor(AbstractAction action, Class viewClass, Object object, boolean modifierPressed) {
        getPort().openEditor(action, viewClass, object, modifierPressed);
    }

    public static void setUserData(UserData userData) {
        getPort().setUserData(userData);
    }

    public static UserData getUserData() {
        return getPort().getUserData();
    }

    public static void openView(RPCView v, boolean modifierPressed) {
        getPort().openView(v, modifierPressed);
    }


    public static void alert(Throwable throwable) {
        getPort().alert(throwable);
    }

    public static BaseMDDApp getApp() {
        return app;
    }

    public static void setApp(BaseMDDApp app) {
        MDD.app = app;
    }

    public static void openPrivateAreaSelector() {
        getPort().openPrivateAreaSelector();
    }

    public static void open(AbstractArea a) {
        getPort().open(a);
    }

    public static void open(AbstractModule m) {
        getPort().open(m);
    }

    public static void open(MenuEntry m) {
        getPort().open(m);
    }
}
