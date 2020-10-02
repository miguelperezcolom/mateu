package io.mateu.mdd.shared.ui;

import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Set;

public interface IMDDUI {

    boolean isEditingNewRecord();

    IFieldBuilder getFieldBuilder(FieldInterfaced field);

    String getBaseUrl();

    void clearStack();

    String getPath(MenuEntry e);

    App getApp();

    String getCurrentUserLogin();

    UserPrincipal getCurrentUser();

    Collection<FieldInterfaced> getColumnFields(Class targetType);

    void updateTitle(String title);

    boolean isMobile();

    String getUiRootPath();

    String getCurrentState();

    void go(String relativePath);

    void goTo(String path);

    void goBack();

    void goSibling(Object siblingId);

    void open(Method m, Set selection);

    void open(Method m, Object result);

    Set getPendingSelection();

    void setPendingSelection(Set selecion);

    Object getPendingResult();

    void setPendingResult(Object result);
}
