package io.mateu;

import io.mateu.core.infra.MateuController;
import io.mateu.uidl.di.MateuBeanProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

@Component
public class SpaRedirectFilter extends OncePerRequestFilter {

    @Value("${server.port:8080}")
    private int serverPort;
    private final List<HandlerMapping> handlerMappings;

  public SpaRedirectFilter(List<HandlerMapping> handlerMappings) {
    this.handlerMappings = handlerMappings;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

      int requestPort = request.getLocalPort();

      // Solo aplicamos la lógica si el puerto es el de la aplicación
      if (requestPort == serverPort) {
          // ... TU LÓGICA AQUÍ (ej. validar JWT, logs, etc.)

          String path = request.getRequestURI();

          // 1. Si es la raíz o tiene punto (recurso), dejar pasar
          if (path.equals("/") || path.contains(".")) {
              filterChain.doFilter(request, response);
              return;
          }

          // 2. Comprobar si existe un controlador mapeado para esta ruta
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

          // 3. Si NO hay un controlador, es una ruta de la UI -> Forward al index
          if (!hasHandler) {
              boolean found = false;
              for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
                  if (!"".equals(controller.getBaseUrl())) {
                      if (path.startsWith(controller.getBaseUrl())) {
                          path = controller.getBaseUrl();
                          found = true;
                          break;
                      }
                  }
              }
              if (!found) {
                  if (path.startsWith("/mateu")) {
                  } else {
                      path = "/";
                  }
              }
              request.getRequestDispatcher(path).forward(request, response);
              return;
          }
      }

    filterChain.doFilter(request, response);
  }
}
