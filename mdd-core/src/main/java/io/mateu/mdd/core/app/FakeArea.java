package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;

import java.util.ArrayList;
import java.util.List;

public class FakeArea extends AbstractArea {
    private final boolean publicAccess;

    public FakeArea(String name, boolean publicAccess, AbstractAction defaultAction) {
        super(name);
        this.publicAccess = publicAccess;
        this.defaultAction = defaultAction;
    }

    @Override
    public List<IModule> buildModules() {
        IArea area = this;
        return List.of(new AbstractModule(){

            @Override
            public String getName() {
                return "Menu";
            }

            @Override
            public List<MenuEntry> buildMenu() {
                return new ArrayList<>();
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
