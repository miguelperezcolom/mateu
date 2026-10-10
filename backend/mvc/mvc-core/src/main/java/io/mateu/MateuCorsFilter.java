package io.mateu;

import io.mateu.core.infra.CorsPolicy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Applies the {@code mateu.cors.allowed-origins} allow-list ({@link CorsPolicy}) to Mateu's
 * endpoints. Off unless origins are listed: then a preflight from an allowed origin is answered
 * here (before Spring Security and the handler mappings) and actual responses carry the CORS
 * headers. A request from any other origin gets no CORS headers, so the browser refuses it.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MateuCorsFilter extends OncePerRequestFilter {

  private final CorsPolicy policy;

  public MateuCorsFilter(
      @Value("${" + CorsPolicy.ALLOWED_ORIGINS_PROPERTY + ":}") String allowedOrigins,
      @Value("${" + CorsPolicy.ALLOW_CREDENTIALS_PROPERTY + ":false}") String allowCredentials) {
    this.policy = CorsPolicy.of(allowedOrigins, allowCredentials);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !policy.enabled()
        || request.getHeader("Origin") == null
        || !CorsPolicy.appliesTo(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String origin = request.getHeader("Origin");
    String requestMethod = request.getHeader("Access-Control-Request-Method");
    if (CorsPolicy.isPreflight(request.getMethod(), origin, requestMethod)) {
      var headers =
          policy.preflightHeaders(
              origin, requestMethod, request.getHeader("Access-Control-Request-Headers"));
      if (headers == null) {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return;
      }
      headers.forEach(response::setHeader);
      response.setStatus(HttpServletResponse.SC_OK);
      return;
    }
    policy.responseHeaders(origin).forEach(response::setHeader);
    filterChain.doFilter(request, response);
  }
}
