package io.mateu.mdd.vaadin.components.app.main;

import com.vaadin.ui.*;
import io.mateu.mdd.vaadin.MateuUI;

public class MainComponent extends VerticalLayout {

    public final CssLayout panel;
    private final MateuUI ui;

    public MainComponent(MateuUI ui) {

        this.ui = ui;

        setSizeFull();
        setSpacing(false);
        addStyleName("maincomponent");

        HeaderComponent header = new HeaderComponent(this);

        panel = new CssLayout();
        panel.setSizeFull();
        panel.addStyleName("contenido");

        addComponents(header, panel);
        setExpandRatio(panel, 1);

    }



    public void irA(String donde) {
        ui.irA(donde);
    }
}
