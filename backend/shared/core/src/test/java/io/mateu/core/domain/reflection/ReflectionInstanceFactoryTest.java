package io.mateu.core.domain.reflection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.mateu.core.domain.reflection.samples.WithBuilder;
import io.mateu.core.domain.reflection.samples.WithConstructorParameters;
import io.mateu.core.domain.reflection.samples.WithInitMethod;
import io.mateu.core.domain.reflection.samples.WithObjectConstructorParameters;
import io.mateu.core.domain.reflection.samples.WithProtectedConstructors;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReflectionInstanceFactoryTest {

  class Subclass {}

  final ReflectionInstanceFactory factory = new ReflectionInstanceFactory(new FakeBeanProvider());

  @Test
  void initIsCalled() {
    var instance =
        factory
            .createInstance(WithInitMethod.class.getName(), Map.of(), new FakeHttpRequest())
            .block();
    assertEquals("Mateu", instance.toString());
  }

  @Test
  void instanceIsReturned()
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException {
    var instance = factory.newInstance(WithInitMethod.class, new FakeHttpRequest());
    assertNotNull(instance);

    instance = factory.newInstance(Subclass.class, new FakeHttpRequest());
    assertNotNull(instance);

    instance = factory.newInstance(WithBuilder.class, new FakeHttpRequest());
    assertNotNull(instance);

    instance =
        factory.newInstance(
            WithConstructorParameters.class,
            Map.of(
                "name",
                "Mateu",
                "birthDate",
                LocalDate.of(2008, 4, 18),
                "lastAccess",
                LocalDateTime.of(2025, 5, 9, 21, 15)),
            new FakeHttpRequest());
    assertNotNull(instance);
    assertEquals("Mateu 2008-04-18 2025-05-09T21:15", instance.toString());

    instance =
        factory.newInstance(
            WithObjectConstructorParameters.class,
            Map.of("value", Map.of("name", "Mateu")),
            new FakeHttpRequest());
    assertNotNull(instance);
    assertEquals("Mateu", instance.toString());

    instance =
        factory.newInstance(
            WithObjectConstructorParameters.class,
            Map.of("value", Map.of("name", "Mateu")),
            new FakeHttpRequest());
    assertNotNull(instance);
    assertEquals("Mateu", instance.toString());

    instance =
        factory.newInstance(
            WithProtectedConstructors.class, Map.of("name", "Mateu"), new FakeHttpRequest());
    assertNotNull(instance);
    assertEquals("Mateu", instance.toString());
  }
}
