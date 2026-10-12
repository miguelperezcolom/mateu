package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

import io.mateu.uidl.di.MateuBeanProvider;
import io.micronaut.context.ApplicationContext;
import io.micronaut.context.annotation.Context;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

/**
 * The static {@link MateuBeanProvider} facade is backed as soon as the context starts, not when
 * some bean first happens to inject {@link MicronautBeanProvider}: generated code with no injection
 * (a root {@code @UI}'s index resolving a YAML mount's deep link) reads it on the very first GET.
 */
@MicronautTest
class MicronautBeanProviderTest {

  @Inject ApplicationContext context;

  @Test
  void theBeanProviderIsAnEagerContextBean() {
    assertThat(
        context.getBeanDefinition(MicronautBeanProvider.class).hasDeclaredAnnotation(Context.class),
        is(true));
    assertThat(MateuBeanProvider.isInitialized(), is(true));
  }
}
