package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.notNullValue;

import io.mateu.uidl.interfaces.InstanceFactory;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import io.micronaut.context.ApplicationContext;
import io.micronaut.context.event.StartupEvent;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

/**
 * In an app with no {@code @UI} class (every screen bound by routes.yaml) nothing on the request
 * path builds {@code DefaultInstanceFactory}, the bean that initializes the static {@link
 * MateuInstanceFactory} facade — so the first CRUD search failed. The startup listener builds it.
 */
@MicronautTest
class MateuStaticFacadesStartupTest {

  @Inject ApplicationContext context;

  @Test
  void theInstanceFactoryFacadeIsInitializedAtStartup() throws Exception {
    var field = MateuInstanceFactory.class.getDeclaredField("_instanceFactory");
    field.setAccessible(true);
    field.set(null, null); // as in an app where nothing injected it yet

    context.getBean(MateuStaticFacadesStartup.class).onApplicationEvent(new StartupEvent(context));

    assertThat((InstanceFactory) field.get(null), notNullValue());
  }
}
