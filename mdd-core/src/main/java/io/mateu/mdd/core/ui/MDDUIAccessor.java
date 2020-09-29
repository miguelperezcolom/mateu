package io.mateu.mdd.core.ui;

import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.mdd.shared.ui.IMDDUI;
import io.mateu.mdd.shared.ui.IMDDUIInjector;
import io.mateu.util.Helper;

import java.util.Collection;

public class MDDUIAccessor {

    public static IMDDUIInjector injector;

    private static IMDDUI get() {
        if (injector == null) {
            try {
                injector = Helper.getImpl(IMDDUIInjector.class);
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
}