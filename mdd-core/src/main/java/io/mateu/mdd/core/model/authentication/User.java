package io.mateu.mdd.core.model.authentication;

import com.Ostermiller.util.RandPass;
import com.google.common.base.Strings;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.common.File;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    @Section(value = "Info", card = true)
    @Embedded
    @Output
    private Audit audit = new Audit();

    @Output
    private LocalDateTime lastLogin;

    @Output
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

    @ListColumn("Name")
    @NotNull
    private String name;

    @ListColumn("Email")
    @NotNull
    private String email;

    @Ignored
    private String password = "1";

    public void setPassword(String password) {
        this.password = Helper.md5(password.toLowerCase().trim());
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
    private File photo;

    @TextArea
    private String comments;


    @Section("Access")
    @OneToMany
    private List<Permission> permissions = new ArrayList<Permission>();


    @PrePersist
    public void prePersist() {
        if (password == null) resetPassword();
    }


    public void resetPassword() {
        String password = new RandPass().getPass(6);
        setPassword(Helper.md5(password.toLowerCase().trim()));
    }

    @Action
    public String sendForgottenPasswordEmail() throws Throwable {
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");
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
        if (Strings.isNullOrEmpty(getPassword())) throw new Exception("Missing password for user " + login);
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");
        EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), (getPassword() != null)?"Your password is " + getPassword():"Welcome " + getName(), true);
    }


    @Override
    public String toString() {
        return getLogin();
    }
}
