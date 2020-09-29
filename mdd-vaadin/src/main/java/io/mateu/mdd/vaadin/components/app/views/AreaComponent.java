package io.mateu.mdd.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;

public class AreaComponent extends AbstractViewComponent {

    private final AbstractArea area;

    @Override
    public String toString() {
        return "" + area.getName();
    }

    public AreaComponent(AbstractArea area) {
        this.area = area;

        addStyleName("areaflowcomponent");

        if (MDDUIAccessor.isMobile()) {

            if (area.getModules().length == 1) {

                AbstractModule m = (AbstractModule) area.getModules()[0];

                m.getMenu().stream().forEach(a -> {

                    Button b;
                    addComponent(b = new Button(a.getCaption()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.addStyleName("submenuoption");

                });


            } else {

                for (IModule a : area.getModules()) {
                    Button b;
                    addComponent(b = new Button(a.getName()));
                    b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                    b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                    b.addStyleName("submenuoption");

                };

            }

        } else {

            addComponentsAndExpand(new Label("You are now in the " + area.getName() + " area. Please look at the menu at the left side and choose an option."));

        }

        if (!MDDUIAccessor.isMobile()) addComponentsAndExpand(new Label(""));
    }

}
