package io.mateu.mdd.core.app;


import com.vaadin.ui.Component;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class MDDMenu extends AbstractMenu {

    private List<MenuEntry> m = new ArrayList<>();

    public MDDMenu(Object... args) {
        super((args.length > 0)?"" + args[0]:"Missing parameters at MDDMenu");

        for (int pos = 1; pos < args.length; pos++) {
            if (pos % 2 == 0) {
                if (args[pos - 1] instanceof String && args[pos] instanceof Class) {
                    String n = (String) args[pos - 1];
                    Class c = (Class) args[pos];
                    if (Component.class.isAssignableFrom(c)) {
                        m.add(new MDDOpenCustomComponentAction(n, c));
                    } else if (RpcView.class.isAssignableFrom(c)) {
                        m.add(new MDDOpenListViewAction(n, c));
                    } else if (WizardPage.class.isAssignableFrom(c)) {
                        m.add(new MDDOpenWizardAction(n, c));
                    } else {
                        m.add(new MDDOpenCRUDAction(n, c));
                    }
                } else if (args[pos - 1] instanceof String && args[pos] != null) {
                    String n = (String) args[pos - 1];
                    Object o = args[pos];
                    if (o instanceof AbstractAction) {
                        m.add(((AbstractAction)o).setCaption(n));
                    } else {
                        m.add(new AbstractAction(n) {
                            @Override
                            public void run() {
                                MDDUI.get().getNavegador().getViewProvider().pendingResult = o;
                            }
                        });
                    }
                } else log.debug("Wrong class parameters. Found " + args[pos - 1].getClass().getName() + ", " + args[pos].getClass().getName() + " while expected String, Class");
            }
        }
    }

    @Override
    public List<MenuEntry> buildEntries() {
        return m;
    }
}
