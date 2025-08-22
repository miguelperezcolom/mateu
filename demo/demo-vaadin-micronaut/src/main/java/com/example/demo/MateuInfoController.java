package com.example.demo;

import io.mateu.core.domain.BeanProvider;
import io.mateu.core.domain.reflection.DefaultInstanceFactory;
import io.mateu.uidl.interfaces.RouteResolver;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import lombok.extern.slf4j.Slf4j;

@Controller("/antonia/mateu-info")
@Slf4j
public class MateuInfoController {

  private final BeanProvider beanProvider;
  private final DefaultInstanceFactory instanceFactory;

    public MateuInfoController(BeanProvider beanProvider, DefaultInstanceFactory instanceFactory) {
        this.beanProvider = beanProvider;
        this.instanceFactory = instanceFactory;
    }

    @Get
  public Object get() throws Exception {
    return Map.of("routes", getRoutes());
  }

  private List<String> getRoutes() {
    return beanProvider
            .getBeans(RouteResolver.class).stream()
            .flatMap(resolver -> resolver.supportedRoutesPatterns().stream())
            .map(Pattern::pattern).sorted(String::compareTo).toList();
  }
}
