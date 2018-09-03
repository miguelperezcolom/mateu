package io.mateu.mdd.core.model.authentication;

import com.Ostermiller.util.RandPass;
import com.google.common.base.Strings;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.config.Template;
import io.mateu.mdd.core.model.util.EmailHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * holder for users of our common. It can be an internal user or a user created for a customer or a supplier
 *
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Table(name = "_USER")
@Getter@Setter
public class User {

    @Embedded
    @KPI
    private Audit audit = new Audit();

    @KPI
    private LocalDateTime lastLogin;

    @KPI
    private int failedLogins;


    @Ignored
    private String passwordResetKey;

    @Ignored
    private LocalDateTime passwordResetExpiryDateTime;


    /**
     * login must always be uppercase. It is the primary key.
     */
    @Section("Data")
    @Id
    @ListColumn("Login")
    @NotNull
    private String login;

    @Output
    private boolean oauth;

    @ListColumn("Name")
    @NotNull
    private String name;

    @ListColumn("Email")
    @NotNull
    private String email;

    @Ignored
    private String password;

    public void setPassword(String password) {
        this.password = (password != null)?Helper.md5(password.toLowerCase().trim()):null;
    }

    public boolean checkPassword(String password) {
        return password != null && Helper.md5(password.toLowerCase().trim()).equals(this.password);
    }

    @ListColumn("Status")
    @NotNull
    private USER_STATUS status;

    private LocalDate expiryDate;



    @NotInList
    @ManyToOne(cascade = CascadeType.ALL)
    private Resource photo;

    @TextArea
    private String comments;


    @Section("Access")
    @OneToMany
    private List<Permission> permissions = new ArrayList<Permission>();


    //@PrePersist
    public void prePersist() {
        if (password == null) resetPassword();
    }


    public void resetPassword() {
        String password = new RandPass().getPass(6).toLowerCase().trim();
        System.out.println("resetting password for " + getLogin());
        setPassword(password);
    }

    @Action
    public String sendForgottenPasswordEmail() throws Throwable {
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");
        if (isOauth()) throw new Exception("This users is from OAuth");

        setPasswordResetKey(UUID.randomUUID().toString());
        setPasswordResetExpiryDateTime(LocalDateTime.now().plusHours(4));

        EmailHelper.sendEmail(getEmail(), "Password reset instructions", "" + MDD.getApp().getBaseUrl() + "resetpassword/" + getPasswordResetKey(), true);
        return "An email with instructions has been sent to " + getEmail();
    }


    @PostPersist
    public void post() {
        WorkflowEngine.add(new Runnable() {

            String xid = getLogin();

            @Override
            public void run() {

                try {
                    Helper.transact(new JPATransaction() {
                        @Override
                        public void run(EntityManager em) throws Throwable {
                            em.find(User.class, xid).sendWelcomeEmail();
                        }
                    });
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }

            }
        });
    }

    public void sendWelcomeEmail() throws Throwable {
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");

        if (isOauth()) {
            EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), "Thanks for joining us ;)", false);
        } else if (getPassword() == null) {
            setPasswordResetKey(UUID.randomUUID().toString());
            setPasswordResetExpiryDateTime(LocalDateTime.now().plusHours(4));
            EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), "To set your password please go to " + MDD.getApp().getBaseUrl() + "resetpassword/" + getPasswordResetKey(), true);
        } else {
            EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), "You should already know your password.", true);
        }

    }


    @Override
    public String toString() {
        return getLogin();
    }



    @Action
    public void sendEmail(@Help("If blank the postscript will be sent as the email body") Template template, @Help("If blank, the subject from the templaet will be used") String subject, @TextArea String postscript) throws Throwable {
        if (template != null) {
            Map<String, Object> data = Helper.getGeneralData();
            data.put("postscript", postscript);
            data.put("username", getName());
            data.put("useremail", getEmail());
            EmailHelper.sendEmail(getEmail(), (!Strings.isNullOrEmpty(subject))?subject:template.getSubject(), Helper.freemark(template.getFreemarker(), data), false);
        } else {
            EmailHelper.sendEmail(getEmail(), subject, postscript, false);
        }
    }


    @Action
    public static void sendEmail(@Help("If blank the postscript will be sent as the email body") Template template, @Help("If blank, the subject from the templaet will be used") String subject, @TextArea String postscript, Set<User> selectedUsers) throws Throwable {
        for (User u : selectedUsers) {
            if (template != null) {
                Map<String, Object> data = Helper.getGeneralData();
                data.put("postscript", postscript);
                data.put("username", u.getName());
                data.put("useremail", u.getEmail());
                EmailHelper.sendEmail(u.getEmail(), (!Strings.isNullOrEmpty(subject))?subject:template.getSubject(), Helper.freemark(template.getFreemarker(), data), false);
            } else {
                EmailHelper.sendEmail(u.getEmail(), subject, postscript, false);
            }

        }
    }
}
