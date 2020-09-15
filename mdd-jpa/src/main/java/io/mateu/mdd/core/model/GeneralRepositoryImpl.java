package io.mateu.mdd.core.model;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.model.authentication.Audit;
import io.mateu.mdd.core.model.authentication.USER_STATUS;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.common.Icon;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.multilanguage.Literal;
import io.mateu.mdd.core.util.Notifier;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.mail.EmailHelper;
import io.mateu.mdd.util.persistence.JPATransaction;

import javax.persistence.EntityManager;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class GeneralRepositoryImpl implements GeneralRepository {

    public UserPrincipal findUser(String login) {
        try {
            User[] u = {null};
            Helper.notransact(em -> u[0] = em.find(User.class, login != null?login:"system"), false);
            return u[0];
        } catch (Throwable e) {
            try {
                User[] u = {null};
                Helper.notransact(em -> u[0] = em.find(User.class, "system"), false);
                return u[0];
            } catch (Throwable ee) {
                return null;
            }
        }

    }

    @Override
    public IResource getNewResource() {
        return new Resource();
    }

    @Override
    public Translated getNewTranslated() {
        return new Literal();
    }

    @Override
    public UserPrincipal findUserByPasswordResetKey(String key) throws Throwable {
        User[] u = new User[1];
        Helper.notransact(em -> {
            u[0] = findUserByPasswordResetKey(em, key);
        });
        return u[0];
    }

    @Override
    public void setPassword(String key, String password) throws Throwable {
        Helper.transact(em -> {
            User u = findUserByPasswordResetKey(em, key);
            u.setPassword(password);

            u.setPasswordResetKey(null);
            u.setPasswordResetExpiryDateTime(null);
            if (USER_STATUS.BLOCKED.equals(u.getStatus())) u.setStatus(USER_STATUS.ACTIVE);
        });
    }

    @Override
    public void createUser(String login, String email, String name, String avatarUrl) throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                User u = em.find(User.class, login);

                if (u == null) {
                    u = new User();
                    u.setOauth(true);
                    u.setLogin(login);
                    u.setEmail((email != null)?email:"");
                    u.setName((name != null)?name:"");
                    if (!Strings.isNullOrEmpty(avatarUrl)) u.setPhoto(new Resource(new URL(avatarUrl)));
                    u.setStatus(USER_STATUS.ACTIVE);
                    em.persist(u);
                }
                u.setLastLogin(LocalDateTime.now());

            }
        });

    }

    @Override
    public void changePassword(String login, String currentPassword, String newPassword) throws Throwable {
        Helper.transact(em -> {
            User u = em.find(User.class, login);

            if (!u.checkPassword(currentPassword)) throw new Exception("This is not your current password");
            u.setPassword(newPassword);

        });
    }

    @Override
    public void updateUser(String login, String name, String email, IResource photo) throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                User u = em.find(User.class, login);

                u.setName(name);
                u.setEmail(email);
                u.setPhoto((Resource) photo);

            }
        });

    }

    @Override
    public List<IIcon> findAllIcons() throws Throwable {
        List<Icon> l = Helper.findAll(Icon.class).stream().sorted((a, b) -> a.getId().compareTo(b.getId())).collect(Collectors.toList());
        return new ArrayList<>(l);
    }

    @Override
    public UserPrincipal authenticate(String login, String password) throws Throwable {
        UserPrincipal[] p = new UserPrincipal[1];
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em)throws Throwable {

                if (em.createQuery("select x.login from " + User.class.getName() + " x").getResultList().size() == 0) {
                    Helper.getImpl(IPopulator.class).populate();
                }

                User u = em.find(User.class, login.toLowerCase().trim());
                if (u != null) {
                    if (USER_STATUS.BLOCKED.equals(u.getStatus())) throw new Exception("User " + login + " is blocked due to failed logins.");
                    if (USER_STATUS.EXPIRED.equals(u.getStatus())) throw new Exception("User " + login + " has expired.");
                    if (USER_STATUS.INACTIVE.equals(u.getStatus())) throw new Exception("User " + login + " is not active.");
                    if (u.getPassword() == null) throw new Exception("Missing password for user " + login);
                    if (!u.checkPassword(password)) {
                        u.setFailedLogins(u.getFailedLogins() + 1);
                        if (u.getFailedLogins() >= 10) u.setStatus(USER_STATUS.BLOCKED);
                        Helper.transact(em2 -> em2.merge(u));
                        try {
                            EmailHelper.sendEmail(u.getEmail(), "Failed login attempt", "Login failed due to wrong password", false);
                        } catch (Throwable t) {
                            t.printStackTrace();
                        }
                        if (USER_STATUS.BLOCKED.equals(u.getStatus())) {
                            try {
                                EmailHelper.sendEmail(AppConfig.get(em).getAdminEmailUser(), "User blocked due to failed login attempts", "User " + u.getLogin() + " (" + u.getName() + ", " + u.getEmail() + ") was blocked after " + u.getFailedLogins() + " failed passwords.", false);
                            } catch (Throwable t) {
                                t.printStackTrace();
                            }
                        }
                        throw new Exception("Wrong password. User will be blocked after " + (10 - u.getFailedLogins()) + " attempts");
                    }
                    if (USER_STATUS.INACTIVE.equals(u.getStatus())) throw new Exception("Deactivated user");

                    if (u.getFailedLogins() > 0) u.setFailedLogins(0);

                    if (u.getLastLogin() != null) Notifier.info("Last login: " + u.getLastLogin().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));

                    u.setLastLogin(LocalDateTime.now());

                    p[0] = u;

                } else throw new Exception("No user with login " + login);
            }
        });
        return p[0];
    }

    @Override
    public void recoverPassword(String login) throws Throwable {
        Helper.transact(em -> {
            em.find(User.class, login).sendForgottenPasswordEmail(em);
        });
    }

    @Override
    public AuditRecord getNewAudit(String login) throws Throwable {
        return new Audit(Helper.find(User.class, login));
    }

    private User findUserByPasswordResetKey(EntityManager em, String key) throws Exception {
        List<User> l = em.createQuery("select x from " + User.class.getName() + " x where x.passwordResetKey = :k").setParameter("k", key).getResultList();
        if (l.size() > 0) {
            User u = l.get(0);
            if (USER_STATUS.EXPIRED.equals(u.getStatus())) {
                throw new Exception("User expired. Can not reset password.");
            } else if (u.getLastLogin() != null && (u.getPasswordResetExpiryDateTime() == null || u.getPasswordResetExpiryDateTime().isBefore(LocalDateTime.now()))) {
                throw new Exception("Password reset key expired. Remember it is only valid for 4 hours. Ask for password reset again");
            }
            return u;
        } else throw new Exception("Password reset key not found. Perhaps it was already used. Ask for password reset again");
    }

}
