package io.mateu.mdd.core.app;

import java.util.List;

public class AreaFromMenu extends AbstractArea {
    private final List<MenuEntry> menu;
    private final boolean publicAccess;

    public AreaFromMenu(String name, List<MenuEntry> menu, boolean publicAccess, AbstractAction defaultAction) {
        super(name);
        this.menu = menu;
        this.publicAccess = publicAccess;
        this.defaultAction = defaultAction;
    }

    @Override
    public List<AbstractModule> buildModules() {
        return List.of(new AbstractModule() {

            @Override
            public String getName() {
                return "Menu";
            }

            @Override
            public List<MenuEntry> buildMenu() {
                return menu;
            }
        });
    }

    @Override
    public boolean isPublicAccess() {
        return publicAccess;
    }
}
