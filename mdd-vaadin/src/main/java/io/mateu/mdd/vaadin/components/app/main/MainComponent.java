package io.mateu.mdd.vaadin.components.app.main;

import com.vaadin.ui.CssLayout;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.MateuUI;

public class MainComponent extends VerticalLayout {

    public final CssLayout panel;
    private final MateuUI ui;
    private final HeaderComponent header;

    public MainComponent(MateuUI ui) {

        this.ui = ui;

        setSizeFull();
        setSpacing(false);
        addStyleName("maincomponent");

        header = new HeaderComponent(this);

        panel = new CssLayout();
        panel.setSizeFull();
        panel.addStyleName("contenido");

        App app = MDDUIAccessor.getApp();

        if (!app.getClass().isAnnotationPresent(FullWidth.class)) panel.addStyleName("container");

        addComponents(header, panel);
        setExpandRatio(panel, 1);

        if (app.isForm()) header.setVisible(false);

    }

    public void irA(String donde) {
        ui.irA(donde);
    }

    public HeaderComponent getHeader() {
        return header;
    }


}
