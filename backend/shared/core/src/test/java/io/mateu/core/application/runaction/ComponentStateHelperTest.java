package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;

/**
 * {@link ComponentStateHelper#invoke} used to be {@code @SneakyThrows}, which rethrew the
 * reflective {@code InvocationTargetException} as-is (hiding the real cause) and — because lombok
 * is off the app's runtime classpath — could surface as {@code NoClassDefFoundError: lombok/Lombok}
 * instead of the actual error. It now unwraps the real exception the invoked method threw.
 */
class ComponentStateHelperTest {

  static class Fixture {
    public String ok() {
      return "hi";
    }

    public void boom() {
      throw new IllegalArgumentException("kaboom");
    }
  }

  private static Method method(String name) throws NoSuchMethodException {
    return Fixture.class.getMethod(name);
  }

  @Test
  void invokeReturnsTheResult() throws Exception {
    assertThat(ComponentStateHelper.invoke(method("ok"), new Fixture())).isEqualTo("hi");
  }

  @Test
  void invokeSurfacesTheRealCauseNotTheReflectiveWrapper() throws Exception {
    // the caller sees the business exception the method threw, not InvocationTargetException
    assertThatThrownBy(() -> ComponentStateHelper.invoke(method("boom"), new Fixture()))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("kaboom");
  }
}
