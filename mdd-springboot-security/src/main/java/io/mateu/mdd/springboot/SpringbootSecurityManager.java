package io.mateu.mdd.springboot;

import com.vaadin.server.VaadinRequest;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.security.MateuSecurityManager;
import io.mateu.security.Private;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.http.HttpSession;
import java.net.URL;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

public class SpringbootSecurityManager implements MateuSecurityManager {
    @Override
    public String getName(HttpSession httpSession) {
        return VaadinRequest.getCurrent().getUserPrincipal().getName();
    }

    @Override
    public UserPrincipal getPrincipal(HttpSession httpSession) {
        UserPrincipal p = (UserPrincipal) httpSession.getAttribute("_mateu_principal");
        if (p == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            p = new UserPrincipal() {
                @Override
                public String getLogin() {
                    return SecurityContextHolder.getContext().getAuthentication().getName();
                }

                @Override
                public List<String> getRoles() {
                    return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream().map(c -> c.getAuthority()).collect(Collectors.toList());
                }

                @Override
                public String getName() {
                    return SecurityContextHolder.getContext().getAuthentication().getName();
                }

                @Override
                public String getEmail() {
                    return null;
                }

                @Override
                public URL getPhoto() {
                    return null;
                }
            };
            httpSession.setAttribute("_mateu_principal", p);
        }
        return p;
    }

    @Override
    public void set(HttpSession httpSession, String name) throws Throwable {

    }

    @Override
    public boolean check(HttpSession httpSession, Private annotation) {
        return false;
    }
}
