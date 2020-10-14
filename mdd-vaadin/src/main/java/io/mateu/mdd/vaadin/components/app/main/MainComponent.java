package io.mateu.mdd.vaadin.components.app.main;

import com.vaadin.server.Responsive;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.MateuUI;

public class MainComponent extends VerticalLayout {

    public final CssLayout panel;
    private final MateuUI ui;
    private final HeaderComponent header;
    private final HeaderForMobileComponent headerForMobile;

    public MainComponent(MateuUI ui) {

        this.ui = ui;

        setSizeFull();
        setSpacing(false);
        addStyleName("maincomponent");

        header = new HeaderComponent(this);
        headerForMobile = new HeaderForMobileComponent(this);

        CssLayout headers = new CssLayout(header, headerForMobile);
        headers.addStyleName("mateu-headers");
        headers.setResponsive(true);
        headers.setWidthFull();

        panel = new CssLayout();
        panel.setSizeFull();
        panel.addStyleName("contenido");

        App app = MDDUIAccessor.getApp();

        if (!app.getClass().isAnnotationPresent(FullWidth.class)) {
            panel.addStyleName("container");
            headers.addStyleName("container");
        }

        addComponents(headers, panel);
        setExpandRatio(panel, 1);

        if (app.isForm()) headers.setVisible(false);

    }

    public void irA(String donde) {
        ui.irA(donde);
    }

    public HeaderComponent getHeader() {
        return header;
    }

    public HeaderForMobileComponent getHeaderForMobile() {
        return headerForMobile;
    }

    public void refreshHeader(boolean isPrivate) {
        getHeader().refresh(isPrivate);
        getHeaderForMobile().refresh(isPrivate);
    }
}
