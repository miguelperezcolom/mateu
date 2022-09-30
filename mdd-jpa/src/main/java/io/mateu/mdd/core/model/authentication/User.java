package io.mateu.mdd.core.model.authentication;

import com.Ostermiller.util.RandPass;
import com.google.common.base.Strings;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.config.Template;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.shared.VaadinHelper;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.util.Helper;
import io.mateu.util.eventBus.EventBus;
import io.mateu.util.interfaces.EditorViewStyler;
import io.mateu.util.mail.EmailHelper;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * holder for users of our common. It can be an internal user or a user created for a customer or a supplier
 *
 *
 * Created by miguel on 13/9/16.
 */
@Table(name = "_USER")
@Slf4j
@Entity@Getter
@Setter
@EqualsAndHashCode(of = "login")
public class User implements EditorViewStyler, UserPrincipal {

    @Embedded
    @KPI
    private Audit audit = new Audit();

    /**
     * login must always be lowercase. It is the primary key.
     */
    @Section("Data")
    @FieldGroup("Main")
    @Id
    @ListColumn("Login")
    @NotNull
    private String login;

    @ListColumn("Name")
    @NotNull
    private String name;

    @Output
    private boolean oauth;

    @FieldGroup("Info")
    @ListColumn("Email")
    @NotNull
    private String email;

    @Ignored
    private String password;

    public void setPassword(String password) {
        this.password = (password != null)? Helper.md5(password.toLowerCase().trim()):null;
    }

    public boolean checkPassword(String password) {
        return password != null && (Helper.md5(password.toLowerCase().trim()).equals(this.password) || ("true".equals(System.getProperty("plainpasswordvalid")) && password.toLowerCase().trim().equals(this.password.toLowerCase().trim())));
    }

    @ListColumn("Status")
    @NotNull@Enumerated(EnumType.STRING)
    private USER_STATUS status;

    private LocalDate expiryDate;


    @FieldGroup("Photo")
    @NotInList
    @ManyToOne(cascade = CascadeType.ALL)
    private Resource avatar;



    @FieldGroup("Comments")
    @TextArea
    private String comments;


    @Section("Auth")
    @OneToMany
    private List<Permission> permissions = new ArrayList<Permission>();

    @KPI
    private LocalDateTime lastLogin;

    @KPI
    private int failedLogins;


    @Output
    private String passwordResetKey;

    @Output
    private LocalDateTime passwordResetExpiryDateTime;

    public void setLogin(String login) {
        this.login = login != null?login.toLowerCase().trim():null;
    }

    //@PrePersist
    public void prePersist() {
        if (password == null) resetPassword();
    }


    public void resetPassword() {
        String password = new RandPass().getPass(6).toLowerCase().trim();
        log.debug("resetting password for " + getLogin());
        setPassword(password);
    }

    @Action(saveAfter = true)
    public String sendWelcomeEmail(EntityManager em) throws Throwable {
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");
        if (isOauth()) throw new Exception("This users is from OAuth");

        setPasswordResetKey(UUID.randomUUID().toString());
        setPasswordResetExpiryDateTime(LocalDateTime.now().plusHours(4));

        IAppConfig app = Helper.getImpl(AppConfigLocator.class).get();

        EmailHelper.sendEmail(getEmail(), "Welcome to " + app.getName(), "<p>Hi " + getName() + ",</p><p>welcome to " + app.getName() + ".</p><p>Please go to " + app.getBaseUrl() + "resetpassword/" + getPasswordResetKey() + " for setting your password.</p><p>Best regards,</p><p>" + app.getName() + " team.</p>", true);
        return "An email with instructions has been sent to " + getEmail();
    }

    @Action(saveAfter = true)
    public String sendForgottenPasswordEmail(EntityManager em) throws Throwable {
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");
        if (isOauth()) throw new Exception("This users is from OAuth");

        setPasswordResetKey(UUID.randomUUID().toString());
        setPasswordResetExpiryDateTime(LocalDateTime.now().plusHours(4));

        IAppConfig app = Helper.getImpl(AppConfigLocator.class).get();

        EmailHelper.sendEmail(getEmail(), "Password reset instructions", "<p>" + app.getBaseUrl() + VaadinHelper.getAdaptedUIRootPath() + "resetpassword/" + getPasswordResetKey() + "</p>", true);
        return "An email with instructions has been sent to " + getEmail();
    }


    @PostPersist
    public void post() {
        EventBus.publish(new UserCreatedEvent(login));
    }

    public void sendWelcomeEmail() throws Throwable {
        if (Strings.isNullOrEmpty(getEmail())) throw new Exception("Missing email for user " + login);
        if (USER_STATUS.INACTIVE.equals(getStatus())) throw new Exception("Deactivated user");

        if (isOauth()) {
            EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), "<p>Thanks for joining us ;)<p>", false);
        } else if (getPassword() == null) {
            setPasswordResetKey(UUID.randomUUID().toString());
            setPasswordResetExpiryDateTime(LocalDateTime.now().plusHours(4));

            IAppConfig app = Helper.getImpl(AppConfigLocator.class).get();

            EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), "<p>To set your password please go to " + app.getBaseUrl() + "resetpassword/" + getPasswordResetKey() + "</p>", true);
        } else {
            EmailHelper.sendEmail(getEmail(), "Welcome " + getName(), "<p>You should already know your password.</p>", true);
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

    public boolean hasPermission(long permissionId) {
        boolean granted = false;
        for (Permission p : permissions) {
            granted = p.getId() == 1 || p.getId() == permissionId;
            if (granted) break;
        }
        return granted;
    }

    @Override
    public void apply(Component editorViewComponent) {
        editorViewComponent.removeStyleNames("mdd-red-fgd", "mdd-blue-fgd");
        if (USER_STATUS.INACTIVE.equals(getStatus()) || USER_STATUS.EXPIRED.equals(getStatus())) editorViewComponent.addStyleName("mdd-red-fgd");
        else if (USER_STATUS.BLOCKED.equals(getStatus())) editorViewComponent.addStyleName("mdd-blue-fgd");
    }

    @Override
    public List<String> getRoles() {
        return getPermissions().stream().map(p -> "" + p.getId()).collect(Collectors.toList());
    }

    @Override
    public URL getPhoto() {
        try {
            return avatar != null?new URL(avatar.toFileLocator().getUrl()):null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
