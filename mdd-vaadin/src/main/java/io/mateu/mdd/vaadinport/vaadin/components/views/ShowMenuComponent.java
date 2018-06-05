package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.components.views.AbstractViewComponent;

import java.util.ArrayList;
import java.util.List;

public class ShowMenuComponent extends AbstractViewComponent {

    private final MenuEntry action;

    private final CssLayout menu = new CssLayout();

    public ShowMenuComponent(MenuEntry action) {

        this.action = action;

    }

    @Override
    public ShowMenuComponent build() {

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

            Button b = new Button(e.getName(), new Button.ClickListener() {
                    @Override
                    public void buttonClick(Button.ClickEvent event) {
                        //navigator.navigateTo(item.getKey());
                        ((AbstractAction)e).setModifierPressed(event.isAltKey() || event.isCtrlKey()).run();
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

        if (c != null) l.addComponent(c);

        if (l.getComponentCount() > 0) contenedor.addComponent(l);
    }
}
