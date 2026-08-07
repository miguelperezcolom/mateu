package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A single broken/stale {@link RoutedClassProvider} — e.g. a generated route resolver left in
 * {@code target/classes} whose {@code routedClass()} references a class removed at runtime — must
 * be skipped, not abort route resolution for every route. Reproduces the failure that a stale
 * generated resolver caused (a {@link NoClassDefFoundError} from one provider 500'd every route; it
 * was further masked by {@code @SneakyThrows} → {@code NoClassDefFoundError: lombok/Lombok} at
 * runtime).
 */
class DefaultRoutedClassResolverTest {

  @UI("/ok")
  static class Ok {}

  /**
   * Its routed class cannot be loaded (the class it names was removed) — mirrors a stale resolver.
   */
  static class BrokenProvider implements RoutedClassProvider {
    @Override
    public Class<?> routedClass() {
      throw new NoClassDefFoundError("io/example/Deleted");
    }
  }

  static class OkProvider implements RoutedClassProvider {
    @Override
    public Class<?> routedClass() {
      return Ok.class;
    }
  }

  @Test
  void aBrokenProviderIsSkippedInsteadOfFailingResolution() {
    var resolver = new DefaultRoutedClassResolver(List.of(new BrokenProvider()));
    // resolve() consults the (throwing) provider first, so command is never reached for it.
    assertThatCode(() -> resolver.resolve("/anything", null)).doesNotThrowAnyException();
    assertThat(resolver.resolve("/anything", null)).isEmpty();
    assertThat(resolver.resolveApp("/anything", null)).isEmpty();
    assertThat(resolver.resolveAbsolute("/anything", null)).isEmpty();
  }

  @Test
  void aValidProviderStillResolvesAlongsideABrokenOne() {
    var resolver = new DefaultRoutedClassResolver(List.of(new BrokenProvider(), new OkProvider()));
    // matchesAbsolute matches command.baseUrl()+route() against the @UI value, so a minimal command
    // (baseUrl "" + route "/ok") is enough — the broken provider must not stop it being found.
    var command =
        new RunActionCommand("", null, "/ok", null, null, null, null, null, null, null, null);
    var resolved = resolver.resolveAbsolute("/ok", command);
    assertThat(resolved).isPresent();
    assertThat(resolved.get().resolvedClass()).isEqualTo(Ok.class);
  }
}
