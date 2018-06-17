package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.FormLayout;
import com.vaadin.ui.PasswordField;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;

public class LoginFlowComponent extends FormLayout implements FlowViewComponent {

    private final TextField login;
    private final PasswordField password;
    private final String state;

    @Override
    public String getViewTile() {
        return "Login";
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public LoginFlowComponent(String state) {
        this.state = state;
        addComponent(login = new TextField("Login"));
        addComponent(password = new PasswordField("password"));
        addComponent(new Button("Sign in", e -> login()));
    }

    private void login() {

        try {
            UserData u = MDD.getApp().authenticate(login.getValue(), password.getValue());
            MDD.getPort().setUserData(u);
            MDD.openPrivateAreaSelector();
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }

    }

}
