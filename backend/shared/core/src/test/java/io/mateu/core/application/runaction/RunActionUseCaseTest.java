package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.AnnotatedComponent;
import com.example.components.UsingInterfacesComponent;
import io.mateu.core.domain.*;
import io.mateu.core.domain.reflection.ReflectionInstanceFactory;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RunActionUseCaseTest {

  final RunActionUseCase useCase =
      new RunActionUseCase(
          new DefaultInstanceFactoryProvider(
              new BeanProvider() {
                @Override
                public <T> T getBean(Class<T> clazz) {
                  return null;
                }

                @Override
                public <T> Collection<T> getBeans(Class<T> clazz) {
                  return (Collection<T>)
                      List.of(
                          new ReflectionInstanceFactory(
                              new BasicTypeChecker(), new FakeBeanProvider()));
                }
              }),
          new DefaultActionRunnerProvider(new FakeBeanProvider()),
          new DefaultUiIncrementMapperProvider(new FakeBeanProvider()));

  @Test
  void runsMethod() {
    for (var componentType : List.of(AnnotatedComponent.class, UsingInterfacesComponent.class)) {
      var increment =
          useCase
              .handle(
                  new RunActionCommand(
                      "base_url",
                      "component_id",
                      "sayHello",
                      componentType.getName(),
                      Map.of(),
                      Map.of(),
                      new FakeHttpRequest()))
              .block();
      assertThat(increment).isNotNull();
    }
  }
}
