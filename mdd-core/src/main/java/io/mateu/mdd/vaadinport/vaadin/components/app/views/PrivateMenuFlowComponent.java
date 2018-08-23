package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class PrivateMenuFlowComponent extends VerticalLayout {

    @Override
    public String toString() {
        return "Private areas for " + MDD.getApp().getName();
    }

    public PrivateMenuFlowComponent() {

        addStyleName("privatemenuflowcomponent");



        MDD.getApp().getAreas().stream().filter(a -> !a.isPublicAccess()).forEach(a -> {

            Button b;
            addComponent(b = new Button(a.getName(), a.getIcon()));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
            b.addStyleName(ValoTheme.BUTTON_QUIET);

        });

        Button b;
        addComponent(b = new Button("Logout"));
        b.addClickListener(e -> MDDUI.get().getNavegador().goTo("bye"));
        b.addStyleName(ValoTheme.BUTTON_QUIET);

        addComponentsAndExpand(new Label(""));

    }


}
