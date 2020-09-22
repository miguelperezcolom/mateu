package io.mateu.mdd.core.app;

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
    public List<AbstractModule> buildModules() {
        return List.of(new AbstractModule(){

            @Override
            public String getName() {
                return "Menu";
            }

            @Override
            public List<MenuEntry> buildMenu() {
                return new ArrayList<>();
            }
        });
    }


    @Override
    public boolean isPublicAccess() {
        return publicAccess;
    }
}
