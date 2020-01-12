package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.google.common.base.Strings;
import com.vaadin.event.ShortcutAction;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.BaseMDDApp;
import io.mateu.mdd.core.model.authentication.USER_STATUS;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.time.LocalDateTime;
import java.util.List;

public class ResetPasswordFlowComponent extends VerticalLayout {

    private final String key;
    private PasswordField passwordRepeated;
    private PasswordField password;

    @Override
    public String toString() {
        return "Reset password";
    }


    public ResetPasswordFlowComponent(String key) {

        this.key = key;

        addStyleName("logincomponent");


        if (!MDD.isMobile()) setSizeFull();


        try {
            Helper.transact(em -> {

                List<User> l = em.createQuery("select x from " + User.class.getName() + " x where x.passwordResetKey = :k").setParameter("k", key).getResultList();

                if (l.size() > 0) {
                    User u =  l.get(0);
                    if (USER_STATUS.EXPIRED.equals(u.getStatus())) {
                        setError("User expired. Can not reset password.");
                    } else if (u.getLastLogin() != null && (u.getPasswordResetExpiryDateTime() == null || u.getPasswordResetExpiryDateTime().isBefore(LocalDateTime.now()))) {
                        setError("Password reset key expired. Remember it is only valid for 4 hours. Ask for password reset again");
                    } else {

                        Label t;
                        //izda.addComponent(t = new Label("Sign in " + MDD.getApp().getName()));
                        //t.addStyleName(ValoTheme.LABEL_H3);

                        addComponent(password = new PasswordField("New password"));
                        addComponent(passwordRepeated = new PasswordField("Repeat new password"));

                        HorizontalLayout hl;
                        addComponent(hl = new HorizontalLayout());
                        Button b;
                        hl.addComponent(b = new Button("Update password and sign in", e -> login()));
                        //b.setDescription("Click ENTER to update password and sign in");
                        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
                        b.addStyleName(ValoTheme.BUTTON_PRIMARY);

                        if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));



                        if (password != null) password.focus();

                    }
                } else {
                    setError("Password reset key not found. Perhaps it was already used. Ask for password reset again");
                }

            });
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }



    }

    private void setError(String msg) {
        Label l;
        addComponent(l = new Label(msg));
        l.addStyleName(ValoTheme.LABEL_H2);
        l.addStyleName(ValoTheme.NOTIFICATION_ERROR);
    }

    private void login() {
        try {
            String[] login = {""};
            Helper.transact(em -> {
                List<User> l = em.createQuery("select x from " + User.class.getName() + " x where x.passwordResetKey = :k").setParameter("k", key).getResultList();

                if (l.size() > 0) {
                    User u =  l.get(0);
                    if (USER_STATUS.EXPIRED.equals(u.getStatus())) {
                        throw new Exception("User expired. Can not reset password.");
                    } else if (u.getPasswordResetExpiryDateTime() == null || u.getPasswordResetExpiryDateTime().isBefore(LocalDateTime.now())) {
                        throw new Exception("Password reset key expired. Remember it is only valid for 4 hours. Ask for password reset again");
                    } else {

                        if (!Strings.isNullOrEmpty(password.getValue()) && password.getValue().equals(passwordRepeated.getValue())) {

                            u.setPassword(password.getValue());

                            u.setPasswordResetKey(null);
                            u.setPasswordResetExpiryDateTime(null);
                            if (USER_STATUS.BLOCKED.equals(u.getStatus())) u.setStatus(USER_STATUS.ACTIVE);


                            login[0] = u.getLogin();

                        } else {
                            throw new Exception("Both password fields must match. Please try again");
                        }
                    }
                } else throw new Exception("Password reset key not found. Perhaps it was already used. Ask for password reset again");

            });

            MDD.setUserData(((BaseMDDApp)MDD.getApp()).authenticate(login[0], password.getValue()));
            MDDUI.get().getNavegador().goTo("welcome");

        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }


}
