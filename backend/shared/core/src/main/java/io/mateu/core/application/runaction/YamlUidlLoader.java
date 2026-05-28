package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.fluent.Component;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@Singleton
public class YamlUidlLoader {

  private final ObjectMapper mapper;

  public YamlUidlLoader() {
    mapper = YamlUidlMapperFactory.create();
  }

  public Component loadFromSpec(String specPath) {
    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl.getResourceAsStream(specPath);
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(specPath);
    }
    if (resource == null) {
      log.warn("No YAML spec found at classpath:{}", specPath);
      return null;
    }
    try (var is = resource) {
      return mapper.readValue(is, Component.class);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", specPath, e.getMessage());
      return null;
    }
  }

  public Mono<Component> load(RunActionCommand command) {
    var route = stripQueryParams(command.route());
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var yamlPath = "specs/ui/" + route + ".yaml";
    log.info("Looking for YAML spec at classpath:{}", yamlPath);

    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl.getResourceAsStream(yamlPath);
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(yamlPath);
    }
    if (resource == null) {
      log.info("No YAML spec found at {}", yamlPath);
      return Mono.empty();
    }

    try (var is = resource) {
      var component = mapper.readValue(is, Component.class);
      log.info("Loaded component from YAML spec: {}", yamlPath);
      return Mono.just(component);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", yamlPath, e.getMessage());
      return Mono.empty();
    }
  }

  private String stripQueryParams(String route) {
    if (route == null) return "";
    int idx = route.indexOf('?');
    return idx >= 0 ? route.substring(0, idx) : route;
  }
}
