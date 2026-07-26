package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * A record that backs a Mateu form must always be instantiated through its CANONICAL constructor,
 * even when it also declares a smaller convenience constructor. Mateu otherwise picked the
 * fewest-parameter constructor; javac only emits reliable parameter names for the canonical
 * constructor (extra constructors need -parameters), so form fields bound to synthetic argN names
 * and the instance came back empty (name=null, collections empty). This reproduces that regression
 * (an extra WorkflowDefinition/Step-style backward-compatible constructor).
 */
class RecordCanonicalConstructorTest {

  static class NoBeans implements BeanProvider {
    @Override
    public <T> T getBean(Class<T> clazz) {
      return null;
    }

    @Override
    public <T> java.util.Collection<T> getBeans(Class<T> clazz) {
      return java.util.List.of();
    }
  }

  /** Extra constructor omits {@code extra}, defaulting it to a sentinel that reveals its use. */
  public record TwoConstructorFixture(String name, int extra, List<String> items) {
    public TwoConstructorFixture(String name, List<String> items) {
      this(name, -1, items);
    }
  }

  @Test
  void recordWithExtraConstructorIsBuiltViaCanonicalConstructor() {
    var factory = new ReflectionInstanceFactory(new NoBeans());
    var data = Map.<String, Object>of("name", "hello", "extra", 7, "items", List.of("a", "b"));

    TwoConstructorFixture instance = factory.newInstance(TwoConstructorFixture.class, data, null);

    assertThat(instance).isNotNull();
    assertThat(instance.name()).isEqualTo("hello");
    assertThat(instance.items()).containsExactly("a", "b");
    // -1 would mean the smaller convenience constructor was chosen and this field was dropped.
    assertThat(instance.extra()).isEqualTo(7);
  }
}
