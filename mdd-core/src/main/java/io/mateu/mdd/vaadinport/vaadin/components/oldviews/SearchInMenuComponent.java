package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.app.*;

import java.util.ArrayList;
import java.util.List;

public class SearchInMenuComponent extends AbstractViewComponent {

    private final CssLayout menu = new CssLayout();

    @Override
    public String toString() {
        return "Search in menu";
    }

    public SearchInMenuComponent() {
        try {
            build();
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    @Override
    public SearchInMenuComponent build() throws Exception {

        super.build();

        addStyleName("searchinmenucomponent");


        TextField t;
        addComponent(t = new TextField(""));
        //t.setIcon(VaadinIcons.SEARCH);
        t.setPlaceholder("Type to search");
        t.focus();

        t.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> e) {
                search(e.getValue());
            }
        });

        Panel contentContainer = new Panel();
        contentContainer.addStyleName(ValoTheme.PANEL_BORDERLESS);
        contentContainer.addStyleName("contentcontainer");

        contentContainer.setContent(menu);

        addComponentsAndExpand(contentContainer);

        search(null);

        return this;
    }


    private void search(String text) {

        if (text == null) text = "";
        text = text.toLowerCase();

        menu.removeAllComponents();


        List<Found> found = find(text);


        VerticalLayout contenedor;
        menu.addComponent(contenedor = new VerticalLayout());
        contenedor.addStyleName("contenedor");

        if (found.size() == 0) {

            Label l;
            contenedor.addComponent(l = new Label("No match"));

            l.addStyleName(ValoTheme.LABEL_H3);

        } else {

            for (Found f : found) {

                HorizontalLayout hl;
                contenedor.addComponent(hl = new HorizontalLayout());
                hl.setDefaultComponentAlignment(Alignment.MIDDLE_LEFT);
                hl.addStyleName(CSS.NOPADDING);
                Button b;
                hl.addComponent(b = new Button(f.getName()));
                b.addClickListener(ev -> MDDUI.get().getNavegador().goTo(f.getPath()));
                b.addStyleName(ValoTheme.BUTTON_LINK);

                Label l;
                hl.addComponent(l = new Label(f.getDescription()));
                //l.addStyleName(ValoTheme.la);

                b.addStyleName("submenuoption");
                //b.setIcon(testIcon.get());  // sin iconos en el menú

            }

        }
    }

    private List<Found> find(String text) {

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
