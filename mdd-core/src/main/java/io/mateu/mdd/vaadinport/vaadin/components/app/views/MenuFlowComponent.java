package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.server.ExternalResource;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.util.List;
import java.util.stream.Collectors;

public class MenuFlowComponent extends Panel {

    private final AbstractMenu menu;

    @Override
    public String toString() {
        return menu.getName();
    }



    public MenuFlowComponent(AbstractMenu menu) {
        this.menu = menu;

        setSizeFull();
        addStyleName(ValoTheme.PANEL_BORDERLESS);

        CssLayout cssLayout = new CssLayout();

        setContent(cssLayout);

        cssLayout.addStyleName("menuflowcomponent");

        List<MenuEntry> plainActions = menu.getEntries().stream().filter(e -> e instanceof AbstractAction).collect(Collectors.toList());

        if (plainActions.size() > 0) {
            cssLayout.addComponent(createMenuComponent(new AbstractMenu("Options") {
                @Override
                public List<MenuEntry> buildEntries() {
                    return plainActions;
                }
            }));
        }

        menu.getEntries().stream().filter(e -> e instanceof AbstractMenu).forEach(e -> cssLayout.addComponent(createMenuComponent(e)));

    }

    public Component createMenuComponent(MenuEntry e) {
        VerticalLayout l = new VerticalLayout();
        l.setSizeUndefined();

        l.addStyleName("submenupanel");

        fill(l, e, 0);

        return l;
    }

    private void fill(VerticalLayout l, MenuEntry e, int nivel) {

        if (e instanceof AbstractMenu) {

            AbstractMenu m = (AbstractMenu) e;

            VerticalLayout q = new VerticalLayout();
            q.setSizeUndefined();

            q.addStyleName("submenulayout");

            Label t;
            q.addComponent(t = new Label(m.getName()));
            if (nivel == 0) t.addStyleName(ValoTheme.LABEL_H2);
            else if (nivel == 1) t.addStyleName(ValoTheme.LABEL_H3);
            else t.addStyleName(ValoTheme.LABEL_H4);

            m.getEntries().forEach(s -> fill(q, s, nivel + 1));

            l.addComponent(q);

        } else if (e instanceof AbstractAction) {

            Link b;
            String path = MDD.getApp().getMenuId(e);
            l.addComponent(b = new Link(e.getName(), new ExternalResource("/" + path)));
            b.setPrimaryStyleName(ValoTheme.BUTTON_QUIET);
            b.addStyleName("submenuoption");

        }

    }


}
