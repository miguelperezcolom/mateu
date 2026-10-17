package io.mateu;

import io.micronaut.context.annotation.Context;
import io.micronaut.context.env.Environment;
import jakarta.annotation.PreDestroy;

/**
 * Mateu's own settings ({@code mateu.actions.strict}, {@code mateu.errors.detailed}…) read from
 * Micronaut's {@link Environment}: {@code application.properties} / {@code application.yml} /
 * profiles / env, like any Micronaut property. Eager ({@code @Context}), so the source is there
 * before the first request.
 */
@Context
public class MateuMicronautSettings {

  private final AutoCloseable registration;

  public MateuMicronautSettings(Environment environment) {
    registration =
        io.mateu.core.infra.MateuSettings.register(
            key -> environment.getProperty(key, String.class).orElse(null));
  }

  @PreDestroy
  void forget() throws Exception {
    registration.close();
  }
}
