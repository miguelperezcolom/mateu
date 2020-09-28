package io.mateu.mdd.shared.ui;

import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;

import java.util.Collection;

public interface IMDDUI {

    <F, C> void search(RpcView<F,C> fcRpcView);

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
}
