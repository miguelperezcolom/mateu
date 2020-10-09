package io.mateu.mdd.core.app;

import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter@Slf4j
public class Searcher {

    private String menu;

    @Override
    public String toString() {
        return "Menu";
    }

    public List<Found> findByMenu(String text) {
        long t0 = System.currentTimeMillis();

        List<Found> found = new ArrayList<>();

        boolean autentico = MDDUIAccessor.getCurrentUserLogin() != null;

        List<IArea> areas = new ArrayList<>();

        for (IArea a : MDDUIAccessor.getApp().getAreas()) {
            if (autentico) {
                if (!a.isPublicAccess()) {
                    areas.add(a);
                }
            } else {
                if (!MDDUIAccessor.getApp().isAuthenticationNeeded() || a.isPublicAccess()) {
                    areas.add(a);
                }
            }
        }
        for (IArea a : areas) {

            for (IModule m : a.getModules()) {
                for (MenuEntry e : m.getMenu()) {
                    addMenuEntry(found, (AbstractArea) a, (AbstractModule) m, e, text, a.getName() + " / " + m.getName());
                }
            }

        }

        log.debug("Search of " + text + " took " + (System.currentTimeMillis() - t0) + "ms.");

        return found;

    }

    private void addMenuEntry(List<Found> found, AbstractArea a, AbstractModule m, MenuEntry e, String text, String prefix) {

        if (e instanceof AbstractMenu) {

            for (MenuEntry ez : ((AbstractMenu) e).getEntries()) {
                addMenuEntry(found, a, m, ez, text, prefix + " / " + ez.getCaption()); //("".equals(text) || e.getName().toLowerCase().contains(text))?"":text);
            }

        } else if (e instanceof AbstractAction) {

            if ("".equals(text) || e.getCaption().toLowerCase().contains(text)) {

                found.add(new Found(MDDUIAccessor.getPath(e), e.getCaption(), prefix));

            }

        }

    }
}
