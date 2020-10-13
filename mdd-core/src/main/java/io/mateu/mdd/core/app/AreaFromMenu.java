package io.mateu.mdd.core.app;

import com.google.common.collect.Lists;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;

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
    public List<IModule> buildModules() {
        IArea area = this;
        return Lists.newArrayList(new AbstractModule() {

            @Override
            public String getName() {
                return "Menu";
            }

            @Override
            public List<MenuEntry> buildMenu() {
                return menu;
            }

            @Override
            public IArea getArea() {
                return area;
            }
        });
    }

    @Override
    public boolean isPublicAccess() {
        return publicAccess;
    }
}
