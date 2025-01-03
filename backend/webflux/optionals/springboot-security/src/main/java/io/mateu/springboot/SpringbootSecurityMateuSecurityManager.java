package io.mateu.springboot;

import io.mateu.uidl.annotations.Private;
import io.mateu.uidl.interfaces.MateuSecurityManager;
import io.mateu.uidl.interfaces.UserPrincipal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SpringbootSecurityMateuSecurityManager implements MateuSecurityManager {

  @Override
  public UserPrincipal getPrincipal(ServerHttpRequest serverHttpRequest) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return new UserPrincipal() {
      @Override
      public String getLogin() {
        return authentication.getName();
      }

      @Override
      public List<String> getRoles() {
        return authentication.getAuthorities().stream()
            .map(a -> a.getAuthority())
            .collect(Collectors.toList());
      }

      @Override
      public String getName() {
        return authentication.getName();
      }
    };
  }

  @Override
  public boolean check(Private annotation, ServerHttpRequest serverHttpRequest) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (!authentication.isAuthenticated()) {
      return false;
    }
    boolean hasUsers = annotation.users() != null && annotation.users().length > 0;
    boolean hasRoles = annotation.roles() != null && annotation.roles().length > 0;
    if (hasUsers) {
      if (Arrays.asList(annotation.users()).contains(authentication.getName())) {
        return true;
      }
    }
    if (hasRoles) {
      for (String role : annotation.roles()) {
        if (authentication.getAuthorities().stream()
            .map(a -> a.getAuthority())
            .anyMatch(s -> s.equals(role))) {
          return true;
        }
      }
    }
    return !hasUsers && !hasRoles;
  }
}
