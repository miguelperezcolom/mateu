package io.mateu;

import io.mateu.core.infra.ClientErrorLog;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * {@code POST <baseUrl>/mateu/v3/client-log}: the errors the renderer hit or showed, written to the
 * log by {@link ClientErrorLog}.
 *
 * <p>A filter and not a controller because the endpoint lives under EVERY UI's base URL (each
 * generated controller maps {@code <baseUrl>/mateu/v3/**}), and a path pattern cannot express "any
 * prefix, then this". Ordered after Spring Security's filter chain (-100), so the endpoint is
 * protected exactly like the other {@code /mateu/v3} calls and the principal is known.
 */
@Component
@Order(0)
public class MateuClientLogFilter extends OncePerRequestFilter {

  private final boolean enabled;

  public MateuClientLogFilter(
      @Value("${" + ClientErrorLog.ENABLED_PROPERTY + ":true}") boolean enabled) {
    this.enabled = enabled;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !"POST".equalsIgnoreCase(request.getMethod())
        || !ClientErrorLog.isEndpoint(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    if (!enabled) {
      response.setStatus(ClientErrorLog.NOT_FOUND);
      return;
    }
    if (ClientErrorLog.tooLarge(request.getContentLengthLong())) {
      response.setStatus(ClientErrorLog.PAYLOAD_TOO_LARGE);
      return;
    }
    byte[] body;
    try {
      body = request.getInputStream().readNBytes(ClientErrorLog.MAX_BODY_BYTES + 1);
    } catch (IOException e) {
      response.setStatus(ClientErrorLog.BAD_REQUEST);
      return;
    }
    Principal principal = request.getUserPrincipal();
    response.setStatus(ClientErrorLog.handle(body, principal != null ? principal.getName() : null));
  }
}
