package com.example.demo.antonia;

import io.mateu.core.domain.BeanProvider;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Path("/antonia/mateu-info")
@Slf4j
public class MateuInfoController {

  private final BeanProvider beanProvider;

    public MateuInfoController(BeanProvider beanProvider) {
        this.beanProvider = beanProvider;
    }

  @GET
  public Object get() throws Exception {
    return Map.of("routes", getRoutes());
  }

  private List<String> getRoutes() {
    return beanProvider
            .getBeans(RouteResolver.class).stream()
            .flatMap(resolver -> resolver.getSupportedRoutesPatterns().stream())
            .map(Pattern::pattern).sorted(String::compareTo).toList();
  }
}
