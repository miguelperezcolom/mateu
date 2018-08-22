package io.mateu.mdd.vaadinport.vaadin.components.app.desktop;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class HeaderComponent extends HorizontalLayout {

    private final AbstractApplication app;
    private final Button signingButton;
    private final Button appTitle;
    private final Button hamburquesa;
    private final DesktopAppComponent appComponent;
    private final Label greeting;
    private final Button tabsButton;
    private final Button navigateButton;

    public HeaderComponent(DesktopAppComponent appComponent, AbstractApplication app) {
        this.appComponent = appComponent;
        this.app = app;
        
        addStyleName("appheader");

        setSpacing(true);
        setWidth("100%");

        addComponent(hamburquesa = new Button(VaadinIcons.MENU));
        hamburquesa.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
        hamburquesa.setStyleName("burguer");
        
        hamburquesa.addClickListener(e -> appComponent.toggleMenu());

        addComponent(appTitle = new Button(app.getName()));
        appTitle.addStyleName(ValoTheme.BUTTON_LINK);
        appTitle.addStyleName("apptitle");
        appTitle.addClickListener(e -> MDDUI.get().getNavegador().goTo(""));
        appTitle.setDescription("Go home");

        Label spacing;
        addComponent(spacing = new Label(""));
        spacing.setWidth("100%");

        addComponent(greeting = new Label(""));
        greeting.addStyleName("greeting");


        addComponent(navigateButton = new Button(VaadinIcons.ARROWS_CROSS));
        navigateButton.addStyleName(ValoTheme.BUTTON_LINK);
        navigateButton.addClickListener(e -> MDDUI.get().getNavegador().goTo("menu"));
        navigateButton.addStyleName("navigate");

        addComponent(tabsButton = new Button(VaadinIcons.TABS));
        tabsButton.addStyleName(ValoTheme.BUTTON_LINK);
        tabsButton.addClickListener(e -> MDDUI.get().getNavegador().openNewTab());
        tabsButton.addStyleName("tabs");


        addComponent(signingButton = new Button("Login"));
        signingButton.addStyleName(ValoTheme.BUTTON_LINK);
        signingButton.addStyleName("signingbutton");
        signingButton.addClickListener(e -> {
            if (MDD.getUserData() != null) {
                MDDUI.get().getNavegador().goTo("bye");
            } else {
                MDDUI.get().getNavegador().goTo("login");
            }
        });

        if (!app.isAuthenticationNeeded()) signingButton.setVisible(false);

        setExpandRatio(spacing, 1);


        updateSession();
    }

    public void updateSession() {

        if (MDD.getUserData() != null) {
            greeting.setValue("Hi " + MDD.getUserData().getName());
            signingButton.setCaption("Logout");
        } else {
            greeting.setValue("");
            signingButton.setCaption("Login");
        }

    }
}
