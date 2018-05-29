package io.mateu.mdd.core.app;

import java.util.List;

/**
 * Created by miguel on 8/8/16.
 */
public abstract class AbstractModule {

    private List<MenuEntry> menu;

    public abstract String getName();

    public List<MenuEntry> getMenu() {
        if (menu == null) menu = buildMenu();
        return menu;
    }

    public abstract List<MenuEntry> buildMenu();

}
