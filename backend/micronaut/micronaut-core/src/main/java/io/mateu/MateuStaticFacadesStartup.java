package io.mateu;

import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.micronaut.context.BeanContext;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Singleton;

/**
 * Micronaut beans are LAZY: {@code DefaultInstanceFactory} initializes the static {@code
 * MateuInstanceFactory} facade in its constructor, and in an app with no {@code @UI} class (every
 * screen bound by routes.yaml — the "Code + YAML" flavour) nothing on the request path injects it,
 * so the first CRUD search threw "MateuInstanceFactory has not been initialized". Build it at
 * startup — the Micronaut twin of Quarkus' StartupEvent observer and Helidon's {@code
 * HelidonCDIProducer}.
 */
@Singleton
public class MateuStaticFacadesStartup implements ApplicationEventListener<StartupEvent> {

  private final BeanContext beanContext;

  public MateuStaticFacadesStartup(BeanContext beanContext) {
    this.beanContext = beanContext;
  }

  @Override
  public void onApplicationEvent(StartupEvent event) {
    beanContext.getBean(DefaultInstanceFactory.class);
  }
}
