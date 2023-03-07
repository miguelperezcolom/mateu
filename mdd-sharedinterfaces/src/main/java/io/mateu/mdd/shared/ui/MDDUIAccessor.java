package io.mateu.mdd.shared.ui;

import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.util.SharedHelper;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Set;

@Slf4j
public class MDDUIAccessor {

    public static IMDDUIInjector injector;

    private static IMDDUI get() {
        if (injector == null) {
            try {
                injector = SharedHelper.getImpl(IMDDUIInjector.class);
            } catch (Exception e) {
                log.warn("No implementation found for " + IMDDUI.class.getName());
                injector = new IMDDUIInjector() {
                    @Override
                    public IMDDUI get() {
                        return new IMDDUI() {
                            @Override
                            public boolean isEditingNewRecord() {
                                return false;
                            }

                            @Override
                            public IFieldBuilder getFieldBuilder(FieldInterfaced field) {
                                return null;
                            }

                            @Override
                            public String getBaseUrl() {
                                return null;
                            }

                            @Override
                            public void clearStack() {

                            }

                            @Override
                            public String getPath(MenuEntry e) {
                                return null;
                            }

                            @Override
                            public App getApp() {
                                return null;
                            }

                            @Override
                            public String getCurrentUserLogin() {
                                return null;
                            }

                            @Override
                            public UserPrincipal getCurrentUser() {
                                return null;
                            }

                            @Override
                            public Collection<FieldInterfaced> getColumnFields(Class targetType) {
                                return null;
                            }

                            @Override
                            public void updateTitle(String title) {

                            }

                            @Override
                            public boolean isMobile() {
                                return false;
                            }

                            @Override
                            public String getUiRootPath() {
                                return null;
                            }

                            @Override
                            public String getCurrentState() {
                                return null;
                            }

                            @Override
                            public void go(String relativePath) {

                            }

                            @Override
                            public void goTo(String path) {

                            }

                            @Override
                            public void goBack() {

                            }

                            @Override
                            public void goSibling(Object siblingId) {

                            }

                            @Override
                            public void open(FieldInterfaced field, Method m, Set selection) {

                            }

                            @Override
                            public void open(Method m, Set selection) {

                            }

                            @Override
                            public void open(Method m, Object result) {

                            }

                            @Override
                            public Set getPendingSelection() {
                                return null;
                            }

                            @Override
                            public void setPendingSelection(Set selecion) {

                            }

                            @Override
                            public Object getPendingResult() {
                                return null;
                            }

                            @Override
                            public void setPendingResult(Object result) {

                            }

                            @Override
                            public void updateSession() {

                            }

                            @Override
                            public Set getSelectedRows() {
                                return null;
                            }
                        };
                    }
                };
            }
        }
        return injector.get();
    }

    public static boolean isEditingNewRecord() {
        return get() != null && get().isEditingNewRecord();
    }

    public static IFieldBuilder getFieldBuilder(FieldInterfaced field) {
        return get() != null?get().getFieldBuilder(field):null;
    }

    public static String getBaseUrl() {
        return get() != null?get().getBaseUrl():"";
    }

    public static void clearStack() {
        if (get() != null) get().clearStack();
    }

    public static void push(String message) {
    }

    public static void pushDone(String message) {
    }

    public static String getPath(MenuEntry e) {
        return get() != null?get().getPath(e):null;
    }

    public static String getCurrentUserLogin() {
        return get() != null?get().getCurrentUserLogin():null;
    }

    public static App getApp() {
        return get() != null?get().getApp():null;
    }

    public static UserPrincipal getCurrentUser() {
        return get() != null?get().getCurrentUser():null;
    }

    public static Collection<FieldInterfaced> getColumnFields(Class targetType) {
        return get() != null?get().getColumnFields(targetType):null;
    }

    public static void updateTitle(String title) {
        if (get() != null) get().updateTitle(title);
    }

    public static boolean isMobile() {
        return get() != null && get().isMobile();
    }

    public static String getUiRootPath() {
        return get() != null?get().getUiRootPath():"";
    }

    public static void go(String state) {
        if (get() != null) get().go(state);
    }

    public static void goTo(String state) {
        if (get() != null) get().goTo(state);
    }

    public static String getCurrentState() {
        return get() != null?get().getCurrentState():null;
    }

    public static void goBack() {
        if (get() != null) get().goBack();
    }

    public static void goSibling(Object siblingId) {
        if (get() != null) get().goSibling(siblingId);
    }

    public static void open(Method m, Set selection) {
        if (get() != null) get().open(m, selection);
    }

    public static void open(Method m, Object result) {
        if (get() != null) get().open(m, result);
    }

    public static Set getPendingSelection() {
        return get() != null?get().getPendingSelection():null;
    }

    public static void setPendingSelection(Set selecion) {
        if (get() != null) get().setPendingSelection(selecion);
    }

    public static Object getPendingResult() {
        return get() != null?get().getPendingResult():null;
    }

    public static void setPendingResult(Object result) {
        if (get() != null) get().setPendingResult(result);
    }

    public static void updateSession() {
        if (get() != null) get().updateSession();
    }

    public static String getPersistenceUnitName() {
        return getApp() != null?getApp().getPersistenceUnitName():"";
    }

    public static Set getSelectedRows() {
        return get() != null?get().getSelectedRows():null;
    }

}
