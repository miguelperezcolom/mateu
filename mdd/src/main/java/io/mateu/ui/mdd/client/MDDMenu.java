package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.AbstractMenu;
import io.mateu.ui.core.client.app.MenuEntry;

import java.util.ArrayList;
import java.util.List;

public class MDDMenu extends AbstractMenu {

    private List<MenuEntry> m = new ArrayList<>();

    public MDDMenu(Object... args) {
        super((args.length > 0)?"" + args[0]:"Missing parameters at MDDMenu");

        for (int pos = 2; pos < args.length; pos++) {
            if (pos % 2 == 1) {
                if (args[pos - 1] instanceof String && args[pos] instanceof Class) {
                    String n = (String) args[pos - 1];
                    Class c = (Class) args[pos];
                    m.add(new MDDAction(n, c));
                } else System.out.println("Wrong class parameters. Found " + args[pos - 1].getClass().getName() + ", " + args[pos].getClass().getName() + " while expected String, Class");
            }
        }
    }

    @Override
    public List<MenuEntry> getEntries() {
        return m;
    }
}
