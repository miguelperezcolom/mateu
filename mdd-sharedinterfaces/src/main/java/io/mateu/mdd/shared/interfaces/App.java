package io.mateu.mdd.shared.interfaces;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;

public interface App {
    IArea[] getAreas();

    boolean isAuthenticationNeeded();

    boolean isChartsEnabled();

    String getName();

    IFieldBuilder getFieldBuilder(FieldInterfaced f);

    boolean hasPublicContent();

    IArea getDefaultPrivateArea();

    IArea getDefaultPublicArea();

    String getState(Object part);

    boolean hasPrivateContent();

    String getMenuId(MenuEntry action);

    Object getSearcher();

    IArea getArea(String state);

    MenuEntry getMenu(String path);

    IModule getModule(String path);

    IArea getArea(IModule module);

    void updateSession();

    String getLogo();

    boolean hasRegistrationForm();
}
