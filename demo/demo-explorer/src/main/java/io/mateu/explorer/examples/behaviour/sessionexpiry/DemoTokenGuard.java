package io.mateu.explorer.examples.behaviour.sessionexpiry;

import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * DEMO STAND-IN for your security layer. Mateu does not authenticate: in a real app the 401 comes
 * from Spring Security / your gateway when the token expired. Here a revoked token (the one the
 * demo's "Expire my session" button named) gets a 401 on the demo app's requests — that is all.
 */
@Component
public class DemoTokenGuard extends OncePerRequestFilter {

  private static final Set<String> REVOKED = ConcurrentHashMap.newKeySet();

  static String tokenOf(HttpRequest httpRequest) {
    var header = httpRequest.getHeaderValue("Authorization");
    return header == null || header.isBlank() ? "(none)" : header.replaceFirst("^Bearer ", "");
  }

  static void revoke(String token) {
    REVOKED.add(token);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/apps/session-expiry/mateu/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    var header = request.getHeader("Authorization");
    var token = header == null || header.isBlank() ? "(none)" : header.replaceFirst("^Bearer ", "");
    if (REVOKED.contains(token)) {
      response.sendError(401, "Session expired (demo)");
      return;
    }
    chain.doFilter(request, response);
  }

  /** Serves handler.js (kept next to the YAML so the Explorer can show it). */
  @RestController
  static class HandlerScript {
    @GetMapping(value = "/explorer-assets/session-expiry/handler.js")
    ResponseEntity<byte[]> handler() throws IOException {
      var bytes =
          new ClassPathResource("specs/ui/explorer/behaviour/session-expiry/handler.js")
              .getContentAsByteArray();
      return ResponseEntity.ok().contentType(MediaType.valueOf("text/javascript")).body(bytes);
    }
  }
}
