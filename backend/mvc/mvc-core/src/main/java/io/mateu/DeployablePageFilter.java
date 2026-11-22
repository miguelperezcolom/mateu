package io.mateu;

import io.mateu.core.infra.DeployablePage;
import io.mateu.core.infra.MateuController;
import io.mateu.uidl.di.MateuBeanProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Keeps the renderer jar's deployable page ({@code static/index.html}, made for a CDN — see {@link
 * DeployablePage}) from being served by this app: Spring Boot would answer it as its welcome page
 * at {@code /}, and as a file at {@code /index.html}, when no Mateu UI sits at the root. Those
 * requests answer 404, as they did before the renderer jars shipped the page.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class DeployablePageFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (!"GET".equalsIgnoreCase(request.getMethod())
        && !"HEAD".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    var path = SpaRedirectFilter.pathWithinApp(request);
    return !"/".equals(path) && !"/index.html".equals(path);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    if (DeployablePage.hidden(
        SpaRedirectFilter.pathWithinApp(request),
        baseUrls(),
        Thread.currentThread().getContextClassLoader())) {
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    filterChain.doFilter(request, response);
  }

  private static List<String> baseUrls() {
    var baseUrls = new ArrayList<String>();
    if (!MateuBeanProvider.isInitialized()) {
      return baseUrls;
    }
    for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
      baseUrls.add(controller.getBaseUrl());
    }
    return baseUrls;
  }
}
