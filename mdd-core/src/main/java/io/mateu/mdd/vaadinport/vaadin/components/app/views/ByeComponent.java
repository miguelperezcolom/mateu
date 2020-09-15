package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.views.AbstractViewComponent;

public class ByeComponent extends AbstractViewComponent {

    @Override
    public String toString() {
        return "Bye";
    }

    public ByeComponent() {

        addStyleName("byeflowcomponent");

        addComponent(new Label("It's been nice to see you."));
        addComponent(new Label("Hace a nice day ;)"));

        if (MDD.isMobile()) {

            Button b;
            addComponent(b = new Button("Go to menu"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("public"));
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("submenuoption");
        }

        addComponentsAndExpand(new Label(""));


    }

}
