package io.mateu;

import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.SpaFallback;
import io.mateu.uidl.di.MateuBeanProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

/**
 * The SPA fallback on Spring MVC ({@link SpaFallback}): a GET with no handler of its own (a deep
 * link) is forwarded to the index of the UI that owns it — the longest base URL it lives under,
 * else the root UI.
 */
@Component
public class SpaRedirectFilter extends OncePerRequestFilter {

  private final List<HandlerMapping> handlerMappings;

  public SpaRedirectFilter(List<HandlerMapping> handlerMappings) {
    this.handlerMappings = handlerMappings;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !"GET".equalsIgnoreCase(request.getMethod())
        || !SpaFallback.candidate(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String path = request.getRequestURI();
    var baseUrls = baseUrls();
    // The index of a UI is always served by its own controller.
    if (SpaFallback.isIndex(path, baseUrls) || hasHandler(request)) {
      filterChain.doFilter(request, response);
      return;
    }
    String target = SpaFallback.target(path, baseUrls);
    if (target == null) {
      filterChain.doFilter(request, response);
      return;
    }
    request.getRequestDispatcher(target).forward(request, response);
  }

  private List<String> baseUrls() {
    var baseUrls = new ArrayList<String>();
    for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
      baseUrls.add(controller.getBaseUrl());
    }
    return baseUrls;
  }

  private boolean hasHandler(HttpServletRequest request) {
    try {
      for (HandlerMapping hm : handlerMappings) {
        var handler = hm.getHandler(request);
        if (handler != null
            && handler.getHandler() != null
            && !(handler.getHandler() instanceof ResourceHttpRequestHandler)) {
          return true;
        }
      }
    } catch (Exception e) {
      return false;
    }
    return false;
  }
}
