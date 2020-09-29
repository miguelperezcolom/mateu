package io.mateu.fake;

import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.mdd.shared.ui.IMDDUI;

import java.util.Collection;

public class FakeUI implements IMDDUI {

    public static App app;

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
        return "/";
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
        return app;
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
}
