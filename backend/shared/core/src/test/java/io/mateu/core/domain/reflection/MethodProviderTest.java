package io.mateu.core.domain.reflection;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.reflection.MethodProvider;
import org.junit.jupiter.api.Test;

class MethodProviderTest {

  class TestClass {
    void method1() {}
  }

  @Test
  void returnsNull() {
    var provider = new MethodProvider();
    var method = provider.getMethod(null, "method1");
    assertNull(method);
  }

  @Test
  void returnsMethod() {
    var provider = new MethodProvider();
    var method = provider.getMethod(TestClass.class, "method1");
    assertNotNull(method);

    method = provider.getMethod(TestClass.class, "toString");
    assertNotNull(method);
  }
}
