package io.mateu.mdd.vaadin.components.app.views.firstLevel;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;

import java.util.List;
import java.util.stream.Collectors;

public class MenuComponent extends AbstractViewComponent {

    private final AbstractMenu menu;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.MENU;
    }

    @Override
    public String toString() {
        return menu.getCaption();
    }



    public MenuComponent(AbstractMenu menu) {
        this.menu = menu;

        Panel p = new Panel();
        p.setSizeFull();
        p.addStyleName(ValoTheme.PANEL_BORDERLESS);

        CssLayout cssLayout = new CssLayout();

        p.setContent(cssLayout);

        cssLayout.addStyleName("menuflowcomponent");

        List<MenuEntry> plainActions = menu.getEntries().stream().filter(e -> e instanceof AbstractAction).collect(Collectors.toList());

        if (plainActions.size() > 0) {
            //cssLayout.addComponent(createMenuComponent(new AbstractMenu(menu.getEntries().stream().filter(e -> e instanceof AbstractMenu).count() > 0?"Main":"") {
            cssLayout.addComponent(createMenuComponent(new AbstractMenu("Options") {
                @Override
                public List<MenuEntry> buildEntries() {
                    return plainActions;
                }
            }));
        }

        menu.getEntries().stream().filter(e -> e instanceof AbstractMenu).forEach(e -> cssLayout.addComponent(createMenuComponent(e)));

        addComponents(p);
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

            if (!Strings.isNullOrEmpty(m.getCaption())) {
                Label t;
                q.addComponent(t = new Label(m.getCaption()));
                if (nivel == 0) t.addStyleName(ValoTheme.LABEL_H2);
                else if (nivel == 1) t.addStyleName(ValoTheme.LABEL_H3);
                else t.addStyleName(ValoTheme.LABEL_H4);
            }

            m.getEntries().forEach(s -> fill(q, s, nivel + 1));

            l.addComponent(q);

        } else if (e instanceof AbstractAction) {

            App app = MDDUIAccessor.getApp();

            Button b;
            l.addComponent(b = new Button(e.getCaption(), ev -> MDDUIAccessor.goTo(app.getMenuId(e))));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");

        }

    }


}
