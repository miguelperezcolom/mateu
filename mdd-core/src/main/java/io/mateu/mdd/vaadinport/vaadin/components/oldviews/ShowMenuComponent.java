package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class ShowMenuComponent extends AbstractViewComponent {

    private final MenuEntry action;

    private final CssLayout menu = new CssLayout();

    public ShowMenuComponent(MenuEntry action) {

        this.action = action;

    }

    @Override
    public ShowMenuComponent build() throws Exception {

        super.build();

        addStyleName("showmenucomponent");

        VerticalLayout contentContainer = new VerticalLayout();
        contentContainer.addStyleName("contentcontainer");

        contentContainer.addComponent(menu);

        addComponentsAndExpand(contentContainer);

        addMenuEntry(menu, action);

        return this;
    }


    private void addMenuEntry(Layout contenedor, MenuEntry e) {
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
                addMenuEntry(lz, ez);
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

            Button b;
            addComponent(b = new Button(e.getName()));
            b.addClickListener(ev -> MDDUI.get().getNavegador().goTo(e));
            b.addStyleName(ValoTheme.BUTTON_LINK);

            b.addStyleName("submenuoption");
            //b.setIcon(testIcon.get());  // sin iconos en el menú
            c = b;

        }

        if (c != null) l.addComponent(c);

        if (l.getComponentCount() > 0) contenedor.addComponent(l);
    }
}
