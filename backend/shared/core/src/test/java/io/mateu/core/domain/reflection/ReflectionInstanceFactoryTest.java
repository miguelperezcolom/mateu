package io.mateu.core.domain.reflection;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.domain.BasicTypeChecker;
import io.mateu.core.domain.reflection.samples.WithBuilder;
import io.mateu.core.domain.reflection.samples.WithInitMethod;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReflectionInstanceFactoryTest {

  class Subclass {}

  final ReflectionInstanceFactory factory =
      new ReflectionInstanceFactory(new BasicTypeChecker(), new FakeBeanProvider());

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
    var instance = factory.newInstance(WithInitMethod.class);
    assertNotNull(instance);

    instance = factory.newInstance(Subclass.class);
    assertNotNull(instance);

    instance = factory.newInstance(WithBuilder.class);
    assertNotNull(instance);
  }
}
