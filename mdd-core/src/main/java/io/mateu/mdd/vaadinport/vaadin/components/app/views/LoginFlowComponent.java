package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.google.common.base.Strings;
import com.vaadin.event.ShortcutAction;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.GitHubButton;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.GitHubButton;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.GoogleButton;
import io.mateu.mdd.vaadinport.vaadin.components.oauth.MicrosoftButton;

import java.util.ArrayList;
import java.util.List;

public class LoginFlowComponent extends VerticalLayout {

    private TextField login;
    private PasswordField password;

    @Override
    public String toString() {
        return "Login";
    }


    public LoginFlowComponent() {

        addStyleName("logincomponent");

        Helper.loadProperties();

        setSizeFull();

        List<Layout> layouts = new ArrayList<>();

        if (!"true".equalsIgnoreCase(System.getProperty("oauthonly"))) {
            VerticalLayout izda = new VerticalLayout();

            izda.addStyleName("loginilayoutizda");
            izda.setSizeUndefined();

            Label t;
            //izda.addComponent(t = new Label("Sign in " + MDD.getApp().getName()));
            //t.addStyleName(ValoTheme.LABEL_H3);

            izda.addComponent(login = new TextField("Login"));
            izda.addComponent(password = new PasswordField("password"));

            HorizontalLayout hl;
            izda.addComponent(hl = new HorizontalLayout());
            Button b;
            hl.addComponent(b = new Button("Sign in", e -> login()));
            //b.setDescription("Click ENTER to sign in");
            b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
            b.addStyleName(ValoTheme.BUTTON_PRIMARY);

            hl.addComponent(b = new Button("Forgot password", e -> forgotPassword()));

            izda.addComponentsAndExpand(new Label(""));

            layouts.add(izda);

        }

        if (System.getProperty("oauth.github.client_id") != null
                || System.getProperty("oauth.google.client_id") != null
                || System.getProperty("oauth.microsoft.client_id") != null) {


            VerticalLayout dcha = new VerticalLayout();
            if (layouts.size() > 0) dcha.addStyleName("loginilayoutdcha");
            else dcha.addStyleName("loginilayoutizda");
            dcha.setSizeUndefined();

            Label t;
            dcha.addComponent(t = new Label((layouts.size() > 0)?"Or:":"Choose one"));
            t.addStyleName(ValoTheme.LABEL_H3);

            if (System.getProperty("oauth.github.client_id") != null) dcha.addComponent(new GitHubButton(System.getProperty("oauth.github.client_id"), System.getProperty("oauth.github.client_secret")));

            if (System.getProperty("oauth.google.client_id") != null) dcha.addComponent(new GoogleButton(System.getProperty("oauth.google.client_id"), System.getProperty("oauth.google.client_secret")));

            if (System.getProperty("oauth.microsoft.client_id") != null) dcha.addComponent(new MicrosoftButton(System.getProperty("oauth.microsoft.client_id"), System.getProperty("oauth.microsoft.client_secret")));

            dcha.addComponentsAndExpand(new Label(""));

            layouts.add(dcha);
        }

        if (MDD.isMobile()) {

            VerticalLayout l;
            layouts.add(l = new VerticalLayout());

            Button b;
            l.addComponent(b = new Button("Go back to menu"));
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo("public"));
            b.addStyleName(ValoTheme.BUTTON_QUIET);

        }

        if (layouts.size() > 1) {

            CssLayout cl = new CssLayout();
            layouts.forEach(l -> cl.addComponent(l));
            addComponentsAndExpand(cl);

        } else if (layouts.size() > 0) {

            addComponentsAndExpand(layouts.get(0));

        }



        if (login != null) login.focus();

    }

    private void forgotPassword() {

        if (!Strings.isNullOrEmpty(login.getValue())) {

            try {
                MDD.info(((BaseMDDApp)MDD.getApp()).recoverPassword(login.getValue()));
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }


        } else {

            MDD.alert("Login is required");
            login.focus();

        }


    }

    private void login() {

        if (Strings.isNullOrEmpty(login.getValue())) {
            MDD.alert("Login is required");
            login.focus();
        } else if (Strings.isNullOrEmpty(password.getValue())) {
            MDD.alert("Password is required");
            password.focus();
        } else {

            try {
                UserData u = ((BaseMDDApp)MDD.getApp()).authenticate(login.getValue(), password.getValue());
                MDD.setUserData(u);
                MDDUI.get().getNavegador().goTo("welcome");
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }

        }

    }

}
