package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.AnnotatedComponent;
import com.example.components.UsingInterfacesComponent;
import com.example.fluent.SampleAppProvider;
import io.mateu.core.domain.*;
import io.mateu.core.domain.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.domain.fragmentmapper.ReflectionFragmentMapper;
import io.mateu.core.domain.reflection.ReflectionInstanceFactory;
import io.mateu.core.domain.reflection.RunMethodActionRunner;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class RunActionUseCaseTest {

  final BeanProvider beanProvider =
      new BeanProvider() {
        @Override
        public <T> T getBean(Class<T> clazz) {
          return null;
        }

        @Override
        public <T> Collection<T> getBeans(Class<T> clazz) {
          if (RouteResolver.class.equals(clazz)) {
            return (Collection<T>)
                List.of(
                    new RouteResolver() {

                      @Override
                      public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
                        return AnnotatedComponent.class;
                      }

                      @Override
                      public List<Pattern> getSupportedRoutesPatterns() {
                        return List.of(Pattern.compile("xx"));
                      }
                    });
          }
          if (ActionRunner.class.equals(clazz)) {
            return (Collection<T>) List.of(new RunMethodActionRunner());
          }
          if (UiIncrementMapper.class.equals(clazz)) {
            return (Collection<T>)
                List.of(
                    new ReflectionUiIncrementMapper(
                        new ComponentFragmentMapper(), new ReflectionFragmentMapper()));
          }
          return (Collection<T>)
              List.of(
                  new ReflectionInstanceFactory(new BasicTypeChecker(), new FakeBeanProvider()));
        }
      };

  final RunActionUseCase useCase =
      new RunActionUseCase(
          beanProvider,
          new DefaultInstanceFactoryProvider(beanProvider),
          new DefaultActionRunnerProvider(beanProvider),
          new DefaultUiIncrementMapperProvider(beanProvider));

  @Test
  void runsAction() {
    for (var componentType : List.of(AnnotatedComponent.class, UsingInterfacesComponent.class)) {
      var increment =
          useCase
              .handle(
                  new RunActionCommand(
                      "base_url",
                      "ui_id",
                      "component_id",
                      "consumed_route",
                      "sayHello",
                      componentType.getName(),
                      Map.of(),
                      Map.of(),
                      "initiator_component_id",
                      new FakeHttpRequest()))
              .block();
      assertThat(increment).isNotNull();
    }
  }

  @Test
  void resolvesRoute() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    "xx",
                    "consumed_route",
                    "sayHello",
                    AnnotatedComponent.class.getName(),
                    Map.of(),
                    Map.of(),
                    "initiator_component_id",
                    new FakeHttpRequest()))
            .block();
    assertThat(increment).isNotNull();
  }

  @Test
  void returnsComponent() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    "/sample-app/route_3",
                    "",
                    "",
                    SampleAppProvider.class.getName(),
                    Map.of(),
                    Map.of(),
                    "initiator_component_id",
                    new FakeHttpRequest()))
            .block();
    assertThat(increment).isNotNull();
  }
}
