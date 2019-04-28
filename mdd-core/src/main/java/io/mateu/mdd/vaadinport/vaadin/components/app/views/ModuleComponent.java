package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class ModuleComponent extends VerticalLayout {

    private final AbstractModule module;

    @Override
    public String toString() {
        return "" + module.getName();
    }

    public ModuleComponent(AbstractModule module) {

        this.module = module;

        addStyleName("moduleflowcomponent");

        if (MDD.isMobile()) {

            module.getMenu().stream().forEach(a -> {

                Button b;
                addComponent(b = new Button(a.getName()));
                b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                b.addStyleName("submenuoption");

            });

        }



        if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));


    }

    public AbstractModule getModule() {
        return module;
    }
}
