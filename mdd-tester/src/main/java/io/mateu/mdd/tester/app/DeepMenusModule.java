package io.mateu.mdd.tester.app;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.app.MenuEntry;

import java.util.ArrayList;
import java.util.List;

public class DeepMenusModule extends AbstractModule {
    @Override
    public String getName() {
        return "Deep Menus";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        List<MenuEntry> l = new ArrayList<>();

        for (int i = 0; i < 2; i++) {

            l.add(buildMenu(i, 4));

        }

        return l;
    }

    private MenuEntry buildMenu(int id, int depth) {

        MenuEntry m = null;
        if (depth > 0) {
            m = new AbstractMenu("Submenu " + id) {
                @Override
                public List<MenuEntry> buildEntries() {
                    List<MenuEntry> l = new ArrayList<>();

                    for (int i = 0; i < 5; i++) {
                        l.add(buildMenu(i, depth - 1));
                    }

                    return l;
                }
            };
        } else {
            m = new AbstractAction("Action " + id) {
                @Override
                public void run() {
                    MDD.alert("Hello from option " + id);
                }
            };
        }
        return m;
    }
}
