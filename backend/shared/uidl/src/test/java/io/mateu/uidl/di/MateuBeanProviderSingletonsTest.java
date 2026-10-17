package io.mateu.uidl.di;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link MateuBeanProvider#getSingletonBean} / {@link MateuBeanProvider#getSingletonBeans} ask the
 * container once per provider: a remembered bean never outlives the provider it came from (however
 * that provider was replaced), and a {@code null} answer is asked again.
 */
class MateuBeanProviderSingletonsTest {

  static final class Counting implements BeanProvider {
    final Object bean;
    final List<Object> beans;
    final AtomicInteger getBean = new AtomicInteger();
    final AtomicInteger getBeans = new AtomicInteger();

    Counting(Object bean, List<Object> beans) {
      this.bean = bean;
      this.beans = beans;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T getBean(Class<T> clazz) {
      getBean.incrementAndGet();
      return (T) bean;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> Collection<T> getBeans(Class<T> clazz) {
      getBeans.incrementAndGet();
      return (Collection<T>) beans;
    }
  }

  Object previous;

  @BeforeEach
  void remember() throws Exception {
    var field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    previous = field.get(null);
  }

  @AfterEach
  void restore() throws Exception {
    var field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    field.set(null, previous);
  }

  @Test
  void aBeanIsAskedForOncePerProvider() {
    var first = new Counting("one", List.of("a", "b"));
    MateuBeanProvider.setBeanProvider(first);
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isEqualTo("one");
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isEqualTo("one");
    assertThat(MateuBeanProvider.getSingletonBeans(String.class)).containsExactly("a", "b");
    assertThat(MateuBeanProvider.getSingletonBeans(String.class)).containsExactly("a", "b");
    assertThat(first.getBean).hasValue(1);
    assertThat(first.getBeans).hasValue(1);
    // the plain lookups stay lookups
    MateuBeanProvider.getBean(String.class);
    assertThat(first.getBean).hasValue(2);
  }

  @Test
  void anotherProviderForgetsWhatThePreviousOneAnswered() throws Exception {
    MateuBeanProvider.setBeanProvider(new Counting("one", List.of("a")));
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isEqualTo("one");

    MateuBeanProvider.setBeanProvider(new Counting("two", List.of("b")));
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isEqualTo("two");
    assertThat(MateuBeanProvider.getSingletonBeans(String.class)).containsExactly("b");

    // swapped reflectively, as some tests restore it: still not the stale answer
    var field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    field.set(null, new Counting("three", List.of()));
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isEqualTo("three");
    assertThat(MateuBeanProvider.getSingletonBeans(String.class)).isEmpty();
  }

  @Test
  void aMissingBeanIsAskedForAgainAndAnEmptyCollectionIsRemembered() {
    var empty = new Counting(null, List.of());
    MateuBeanProvider.setBeanProvider(empty);
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isNull();
    assertThat(MateuBeanProvider.getSingletonBean(String.class)).isNull();
    assertThat(empty.getBean).hasValue(2);
    MateuBeanProvider.getSingletonBeans(String.class);
    MateuBeanProvider.getSingletonBeans(String.class);
    assertThat(empty.getBeans).hasValue(1);
  }

  @Test
  void withNoProviderItFailsLikeAPlainLookup() throws Exception {
    var field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    field.set(null, null);
    assertThatThrownBy(() -> MateuBeanProvider.getSingletonBean(String.class))
        .isInstanceOf(IllegalStateException.class);
    assertThatThrownBy(() -> MateuBeanProvider.getSingletonBeans(String.class))
        .isInstanceOf(IllegalStateException.class);
  }
}
