package io.mateu.mdd.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;

public class ModuleComponent extends AbstractViewComponent {

    private final AbstractModule module;

    @Override
    public String toString() {
        return "" + module.getName();
    }

    public ModuleComponent(AbstractModule module) {
        this.module = module;

        addStyleName("moduleflowcomponent");

        if (MDDUIAccessor.isMobile()) {

            module.getMenu().stream().forEach(a -> {

                Button b;
                addComponent(b = new Button(a.getCaption()));
                b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
                b.addStyleName("submenuoption");

            });

        }



        if (!MDDUIAccessor.isMobile()) addComponentsAndExpand(new Label(""));


    }

    public AbstractModule getModule() {
        return module;
    }
}
