package io.mateu.mdd.core;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.lang.reflect.Method;

public interface MDDPort {

    boolean isMobile();

    void alert(String msg);

    void openCRUD(AbstractAction action, Class entityClass, String queryFilters, boolean modifierPressed);

    void openEditor(AbstractAction action, Class viewClass, Object id, boolean modifierPressed);

    UserData getUserData();

    void openView(AbstractAction mddOpenListViewAction, Class listViewClass, boolean modifierPressed);

    void alert(Throwable throwable);

    void setUserData(UserData userData);

    void openPrivateAreaSelector();

    void open(AbstractArea a);

    void open(MenuEntry m);

    void open(AbstractModule m);

    void open(Method m);

    void open(FieldInterfaced f);

    void confirm(String msg, Runnable onOk);

    AbstractApplication getApp();

    void setApp(AbstractApplication app);

    void info(String msg);

    void push(String msg);

    void pushDone(String msg);

    void openWizard(Class firstPageClass);

    void updateTitle(String title);

    boolean isViewingOfficeCurrency();

    boolean isViewingCentralCurrency();
}
