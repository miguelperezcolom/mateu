package io.mateu;

import io.mateu.core.infra.CorsPolicy;
import io.mateu.core.infra.versioning.AppBuild;
import io.mateu.core.infra.versioning.RendererCompatibility;
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
 * The version headers of Mateu's endpoints: every response carries the build id ({@link
 * AppBuild#HEADER}) — refusals and errors included, which is how a renderer tells a stale screen
 * from a permission problem — and the renderer a request names ({@link
 * RendererCompatibility#HEADER}) is checked against this server's wire major.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class MateuVersionHeadersFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !CorsPolicy.appliesTo(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    RendererCompatibility.check(request.getHeader(RendererCompatibility.HEADER));
    // set up front so an error answered by any later layer keeps it; known after the first
    // request has built the wire type allow-list
    var build = AppBuild.id();
    if (build != null) {
      response.setHeader(AppBuild.HEADER, build);
    }
    filterChain.doFilter(request, response);
    if (build == null && !response.isCommitted()) {
      var computed = AppBuild.id();
      if (computed != null) {
        response.setHeader(AppBuild.HEADER, computed);
      }
    }
  }
}
