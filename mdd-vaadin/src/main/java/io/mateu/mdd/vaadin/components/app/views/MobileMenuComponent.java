package io.mateu.mdd.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.MDDUI;

public class MobileMenuComponent extends VerticalLayout {

    private final MenuEntry area;

    @Override
    public String toString() {
        return "" + area.getCaption();
    }

    public MobileMenuComponent(MenuEntry area) {

        this.area = area;

        addStyleName("menuflowcomponent");


        if (area instanceof AbstractMenu) {

            ((AbstractMenu) area).getEntries().stream().forEach(a -> {

                Button b;
                addComponent(b = new Button(a.getCaption()));
                b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                b.addStyleName(ValoTheme.BUTTON_QUIET);

            });

        }



        if (!MDDUIAccessor.isMobile()) addComponentsAndExpand(new Label(""));


    }

}
