package com.example.demo.antonia;

import io.mateu.core.domain.BeanProvider;
import io.mateu.uidl.interfaces.RouteResolver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/antonia/mateu-info")
@Slf4j
public class MateuInfoController {

  private final BeanProvider beanProvider;

    public MateuInfoController(BeanProvider beanProvider) {
        this.beanProvider = beanProvider;
    }

    @GetMapping
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
