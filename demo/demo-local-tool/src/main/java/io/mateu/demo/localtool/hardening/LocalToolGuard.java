package io.mateu.demo.localtool.hardening;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * In front of EVERYTHING the tool serves (the page, its assets and Mateu's {@code /mateu/**}
 * endpoints):
 *
 * <ol>
 *   <li><b>Host check</b> — only {@code 127.0.0.1:<port>} / {@code localhost:<port>}. A DNS
 *       rebinding attack points a domain the attacker owns at 127.0.0.1; the browser then sends
 *       that domain as the Host, so it is refused here.
 *   <li><b>Launch token</b> — {@code ?t=<token>} (once) sets an HttpOnly, SameSite=Strict cookie
 *       and redirects to the same address without the token; after that only requests carrying
 *       the cookie get through. Anything else answers 403.
 * </ol>
 *
 * <p>Mateu exempts its JSON endpoints from Spring Security's CSRF protection; here it is the
 * SameSite=Strict cookie that keeps another site from posting to them.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LocalToolGuard extends OncePerRequestFilter {

  public static final String COOKIE = "local-tool-session";

  private final LaunchToken token;

  public LocalToolGuard(LaunchToken token) {
    this.token = token;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    if (!isLoopbackHost(request.getHeader("Host"), request.getLocalPort())) {
      refuse(response, "Unexpected Host header.");
      return;
    }
    var offered = request.getParameter("t");
    if (offered != null && request.getMethod().equals("GET")) {
      if (!token.redeem(offered)) {
        refuse(
            response,
            "This link was already used (or is wrong). The tool is open in the browser that"
                + " used it; to open it elsewhere, quit and run the command again.");
        return;
      }
      response.addHeader(
          "Set-Cookie",
          ResponseCookie.from(COOKIE, token.session())
              .httpOnly(true)
              .sameSite("Strict")
              .path("/")
              .build()
              .toString());
      response.setStatus(HttpServletResponse.SC_SEE_OTHER);
      response.setHeader("Location", request.getRequestURI()); // the same page, token gone
      return;
    }
    if (!hasSession(request)) {
      refuse(response, "Open the tool from the address the command printed.");
      return;
    }
    chain.doFilter(request, response);
  }

  static boolean isLoopbackHost(String host, int port) {
    return host != null
        && (host.equals("127.0.0.1:" + port) || host.equalsIgnoreCase("localhost:" + port));
  }

  private boolean hasSession(HttpServletRequest request) {
    var cookies = request.getCookies();
    return cookies != null
        && Arrays.stream(cookies)
            .filter(c -> COOKIE.equals(c.getName()))
            .map(Cookie::getValue)
            .anyMatch(token::isSession);
  }

  private static void refuse(HttpServletResponse response, String why) throws IOException {
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    response.setContentType("text/plain;charset=UTF-8");
    response.getWriter().write(why);
  }
}
