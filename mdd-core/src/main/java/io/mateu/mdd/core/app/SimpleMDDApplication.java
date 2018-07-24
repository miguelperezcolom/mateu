package io.mateu.mdd.core.app;

import java.util.Arrays;
import java.util.List;

public abstract class SimpleMDDApplication extends BaseMDDApp {

    @Override
    public List<AbstractArea> buildAreas() {
        List<AbstractArea> l = Arrays.asList(new AbstractArea("") {
            @Override
            public List<AbstractModule> buildModules() {
                List<AbstractModule> m = Arrays.asList(new AbstractModule() {
                    @Override
                    public String getName() {
                        return "";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        return SimpleMDDApplication.this.buildMenu();
                    }
                });
                return m;
            }

            @Override
            public boolean isPublicAccess() {
                return true;
            }
        });
        return l;
    }

    protected abstract List<MenuEntry> buildMenu();
}
