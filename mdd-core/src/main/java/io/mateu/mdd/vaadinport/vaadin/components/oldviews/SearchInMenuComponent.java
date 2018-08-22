package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.components.app.AbstractMDDExecutionContext;

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
    public SearchInMenuComponent build() throws IllegalAccessException, InstantiationException {

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

        boolean autentico = MDD.getUserData() != null;

        menu.removeAllComponents();

        CssLayout contenedor;
        menu.addComponent(contenedor = new CssLayout());
        contenedor.setWidth("100%");
        contenedor.addStyleName("contenedor");

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

            CssLayout la = new CssLayout();
            la.addStyleName("contenedor");
            for (AbstractModule m : a.getModules()) {
                for (MenuEntry e : m.getMenu()) {
                    addMenuEntry(la, a, e, text);
                }
            }

            if (la.getComponentCount() > 0) {
                VerticalLayout vl = new VerticalLayout();
                vl.addStyleName("contenedor");
                Label l;
                vl.addComponent(l = new Label("In " + a.getName() + ":"));
                l.addStyleName("tituloarea");
                vl.addComponent(la);
                vl.setSizeUndefined();
                contenedor.addComponent(vl);
            }

        }
    }

    private void addMenuEntry(Layout contenedor, AbstractArea a, MenuEntry e, String text) {
        VerticalLayout l = new VerticalLayout();
        l.addStyleName("listaopcionesmenu");
        l.setWidthUndefined();

        Component c = null;

        if (e instanceof AbstractMenu) {
            VerticalLayout lx = new VerticalLayout();
            lx.addStyleName("submenu");
            lx.setWidthUndefined();

            VerticalLayout lz = new VerticalLayout();

            lz.addStyleName("contenedorsubmenu");
            lz.setWidthUndefined();

            for (MenuEntry ez : ((AbstractMenu) e).getEntries()) {
                addMenuEntry(lz, a, ez, ("".equals(text) || e.getName().toLowerCase().contains(text))?"":text);
            }

            if (lz.getComponentCount() > 0) lx.addComponent(lz);

            if (lx.getComponentCount() > 0) {
                Label lab;
                lx.addComponent(lab = new Label(e.getName()));
                lab.addStyleName((contenedor instanceof CssLayout)?"titulosubmenuprincipal":"titulosubmenu");

                lx.addComponent(lz);

                c = lx;
            }

        } else if (e instanceof AbstractAction) {

            if ("".equals(text) || e.getName().toLowerCase().contains(text)) {

                Button b = new Button(e.getName(), new Button.ClickListener() {
                    @Override
                    public void buttonClick(Button.ClickEvent event) {
                        //navigator.navigateTo(item.getKey());
                        ((AbstractAction)e).setModifierPressed(event.isAltKey() || event.isCtrlKey()).run(new AbstractMDDExecutionContext());
                    }
                });
                b.setCaption(b.getCaption()
                        //        + " <span class=\"valo-menu-badge\">123</span>"
                );
                b.setCaptionAsHtml(true);
                b.setPrimaryStyleName(ValoTheme.MENU_ITEM);
                b.addStyleName("accionsubmenu");
                //b.setIcon(testIcon.get());  // sin iconos en el menú
                c = b;

            }

        }

        if (c != null) l.addComponent(c);

        if (l.getComponentCount() > 0) contenedor.addComponent(l);
    }
}
