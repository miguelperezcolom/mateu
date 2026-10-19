package io.mateu;

import io.mateu.core.infra.security.JsonBodyGuard;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Answers 415 to a POST to Mateu's action endpoints whose body is not declared JSON ({@link
 * JsonBodyGuard}): the CORS-simple requests a cross-site page could forge with the user's cookies.
 * Right after the CORS filter, ahead of Spring Security and the handler mappings.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class MateuJsonBodyFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !JsonBodyGuard.refuses(
        request.getMethod(), request.getRequestURI(), request.getContentType());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    response.setStatus(JsonBodyGuard.UNSUPPORTED_MEDIA_TYPE);
    response.setContentType("text/plain;charset=UTF-8");
    response.getWriter().write(JsonBodyGuard.MESSAGE);
  }
}
