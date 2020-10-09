package io.mateu.mdd.core.model.authentication;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.security.MateuSecurityManager;
import io.mateu.security.Private;
import io.mateu.util.persistence.JPAHelper;

import javax.servlet.http.HttpSession;
import java.util.List;

@AutoService(MateuSecurityManager.class)
public class MateuSecurityManagerImpl implements MateuSecurityManager {
    @Override
    public boolean validate(HttpSession httpSession, String login, String password) throws Throwable {

        User u = JPAHelper.find(User.class, login);
        if (u == null) throw new Exception("Unknown user");
        if (!USER_STATUS.ACTIVE.equals(u.getStatus())) throw new Exception("Invalid user");
        if (!u.checkPassword(password)) throw new Exception("Invalid password");
        httpSession.setAttribute("__user", new UserPrincipal() {
            @Override
            public String getLogin() {
                return u.getLogin();
            }

            @Override
            public List<String> getRoles() {
                return u.getRoles();
            }

            @Override
            public String getName() {
                return u.getName();
            }

            @Override
            public String getEmail() {
                return u.getEmail();
            }

            @Override
            public IResource getPhoto() {
                return u.getPhoto();
            }
        });

        return true;
    }

    @Override
    public String getName(HttpSession httpSession) {
        return getPrincipal(httpSession).getName();
    }

    @Override
    public UserPrincipal getPrincipal(HttpSession httpSession) {
        return (UserPrincipal) httpSession.getAttribute("__user");
    }

    @Override
    public void set(HttpSession httpSession, String name) {

    }

    @Override
    public boolean check(HttpSession httpSession, Private annotation) {
        return false;
    }

    @Override
    public boolean isProfileAvailable(HttpSession httpSession) {
        return false;
    }

    @Override
    public Object getProfile(HttpSession httpSession) {
        return null;
    }

    @Override
    public String recoverPassword(HttpSession httpSession, String nameOrEmail) {
        return null;
    }
}
