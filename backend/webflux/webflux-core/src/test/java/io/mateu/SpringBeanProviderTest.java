package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.di.MateuBeanProvider;
import java.lang.reflect.Field;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.GenericApplicationContext;

/**
 * The WebFlux {@link SpringBeanProvider}: a lookup that cannot be answered is {@code null} (or an
 * empty collection), never an exception on the request path, and a bean registered under the
 * class's name only answers for exactly that class.
 */
class SpringBeanProviderTest {

  /** The provider installed by the Spring contexts other tests cache — put back afterwards. */
  private Object previous;

  @BeforeEach
  void rememberTheInstalledProvider() throws Exception {
    previous = installedProviderField().get(null);
  }

  @AfterEach
  void restoreTheInstalledProvider() throws Exception {
    installedProviderField().set(null, previous);
  }

  private static Field installedProviderField() throws NoSuchFieldException {
    Field field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    return field;
  }

  static class Base {}

  static class Sub extends Base {}

  @Test
  void aBeanNamedLikeTheClassButOfASubclassIsNotTheAnswer() throws Exception {
    var context = new GenericApplicationContext();
    context.registerBean("base", Sub.class);
    context.refresh();
    var provider = new SpringBeanProvider(context);
    try {
      // "base" holds a Sub: not the exact class, so the lookup falls back to the unique bean by
      // type
      assertThat(provider.getBean(Base.class)).isInstanceOf(Sub.class);
      assertThat(provider.getBean(String.class)).isNull();
      assertThat(provider.getBeans(Sub.class)).hasSize(1);
    } finally {
      provider.destroy();
      context.close();
    }
  }

  @Test
  void aContextThatCannotAnswerYieldsNothingInsteadOfThrowing() throws Exception {
    var context = new GenericApplicationContext();
    context.registerBean("base", Base.class);
    context.refresh();
    var provider = new SpringBeanProvider(context);
    provider.destroy();
    context.close(); // a closed context throws on every lookup

    assertThat(provider.getBean(Base.class)).isNull();
    assertThat(provider.getBeans(Base.class)).isEmpty();
  }
}
