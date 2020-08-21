package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class LoggedOutComponent extends VerticalLayout {

    private Runnable onLogin;
    private TextField login;
    private PasswordField password;

    @Override
    public String toString() {
        return "Bye";
    }


    public LoggedOutComponent() {
        this.onLogin = onLogin;

        addStyleName("logincomponent2");

        Helper.loadProperties();

        setSizeFull();


        VerticalLayout info = new VerticalLayout();
        info.addStyleName("loggedout");

        Label l;
        info.addComponent(l = new Label("Thanks for using " + MDD.getApp().getName() + "."));
        l.addStyleName(ValoTheme.LABEL_H1);
        info.addComponent(l = new Label("Have a nice day ;)"));
        l.addStyleName(ValoTheme.LABEL_H2);


        info.addComponent(new Button("Sign in again", e -> {
            MDDUI.get().getNavegador().goTo("login");
        }));

        HorizontalLayout cl = new HorizontalLayout();
        cl.addStyleName("cajalogin");
        cl.addStyleName(CSS.ALIGNCENTER);
        cl.setSpacing(false);
        //layouts.forEach(l -> cl.addComponent(l));
        cl.addComponent(info);
        addComponent(cl);

    }


}
