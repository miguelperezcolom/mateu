package io.mateu.mdd.shared.ui;

import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.util.SharedHelper;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Set;

public class MDDUIAccessor {

    public static IMDDUIInjector injector;

    private static IMDDUI get() {
        if (injector == null) {
            try {
                injector = SharedHelper.getImpl(IMDDUIInjector.class);
            } catch (Exception e) {
                e.printStackTrace();
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

}