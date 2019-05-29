package io.mateu.mdd.core.app;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.Found;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class Searcher {

    private String menu;

    public List<Found> findByMenu(String text) {
        long t0 = System.currentTimeMillis();

        List<Found> found = new ArrayList<>();

        boolean autentico = MDD.getUserData() != null;

        List<AbstractArea> areas = new ArrayList<>();

        for (AbstractArea a : MDD.getApp().getAreas()) {
            if (autentico) {
                if (!a.isPublicAccess()) {
                    areas.add(a);
                }
            } else {
                if (!MDD.getApp().isAuthenticationNeeded() || a.isPublicAccess()) {
                    areas.add(a);
                }
            }
        }
        for (AbstractArea a : areas) {

            for (AbstractModule m : a.getModules()) {
                for (MenuEntry e : m.getMenu()) {
                    addMenuEntry(found, a, e, text);
                }
            }

        }

        System.out.println("Search of " + text + " took " + (System.currentTimeMillis() - t0) + "ms.");

        return found;

    }

    private void addMenuEntry(List<Found> found, AbstractArea a, MenuEntry e, String text) {

        if (e instanceof AbstractMenu) {

            for (MenuEntry ez : ((AbstractMenu) e).getEntries()) {
                addMenuEntry(found, a, ez, text); //("".equals(text) || e.getName().toLowerCase().contains(text))?"":text);
            }

        } else if (e instanceof AbstractAction) {

            if ("".equals(text) || e.getName().toLowerCase().contains(text)) {

                found.add(new Found(MDDUI.get().getNavegador().getPath(e), e.getName(), "" + a.getName() + " -> " + e.getName()));

            }

        }

    }
}
