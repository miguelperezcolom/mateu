package io.mateu;

import io.mateu.core.infra.MateuController;
import io.mateu.uidl.di.MateuBeanProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

@Component
public class SpaRedirectFilter extends OncePerRequestFilter {

  private final List<HandlerMapping> handlerMappings;

  public SpaRedirectFilter(List<HandlerMapping> handlerMappings) {
    this.handlerMappings = handlerMappings;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String path = request.getRequestURI();

    if (!path.startsWith("/actuator")) {

      // 1. Si es la raíz o tiene punto (recurso), dejar pasar
      if (path.equals("/") || path.contains(".")) {
        filterChain.doFilter(request, response);
        return;
      }

      // 2. Si la ruta coincide exactamente con el baseUrl de un controlador conocido,
      //    es la ruta del index de esa UI → dejar pasar siempre sin comprobar handlers
      for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
        String baseUrl = controller.getBaseUrl();
        if (!baseUrl.isEmpty() && path.equals(baseUrl)) {
          filterChain.doFilter(request, response);
          return;
        }
      }

      // 3. Comprobar si existe un controlador mapeado para esta ruta
      boolean hasHandler = false;
      try {
        for (HandlerMapping hm : handlerMappings) {
          var handler = hm.getHandler(request);
          if (handler != null
              && handler.getHandler() != null
              && !(handler.getHandler() instanceof ResourceHttpRequestHandler)) {
            hasHandler = true;
            break;
          }
        }
      } catch (Exception e) {
        hasHandler = false;
      }

      // 4. Si NO hay un controlador, es una ruta de la UI -> Forward al index
      if (!hasHandler) {
        // Buscar el baseUrl más largo que sea prefijo de la ruta (longest-prefix match)
        String bestBaseUrl = null;
        for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
          String baseUrl = controller.getBaseUrl();
          if (!baseUrl.isEmpty() && path.startsWith(baseUrl + "/")) {
            if (bestBaseUrl == null || baseUrl.length() > bestBaseUrl.length()) {
              bestBaseUrl = baseUrl;
            }
          }
        }
        if (bestBaseUrl != null) {
          path = bestBaseUrl;
        } else if (!path.startsWith("/mateu")) {
          path = "/";
        }
        request.getRequestDispatcher(path).forward(request, response);
        return;
      }
    }

    filterChain.doFilter(request, response);
  }
}
