package io.mateu.core.application.getui;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.HelloWorld;
import com.example.uis.HolaMundo;
import com.example.uis.dynamic.DynamicHelloWorld;
import io.mateu.core.domain.in.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.out.DefaultUiMapperProvider;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class GetUIUseCaseTest {

  final GetUIUseCase useCase =
      new GetUIUseCase(
          new DefaultInstanceFactoryProvider(
              new BeanProvider() {
                @Override
                public <T> T getBean(Class<T> clazz) {
                  return null;
                }

                @Override
                public <T> Collection<T> getBeans(Class<T> clazz) {
                  return (Collection<T>)
                      List.of(new ReflectionInstanceFactory(new FakeBeanProvider()));
                }
              }),
          new DefaultUiMapperProvider(new FakeBeanProvider()));

  @Test
  void returnsUI() {

    for (var type : List.of(DynamicHelloWorld.class, HelloWorld.class)) {
      GetUIQuery request =
          new GetUIQuery(
              type.getName(), "base_url", "current_route", Map.of(), new FakeHttpRequest());
      var ui = useCase.handle(request).block();

      assertThat(ui).isNotNull();
      assertThat(ui.favIcon()).isNull();
      assertThat(ui.title()).isEqualTo("Hello world");
    }
  }

  @Test
  void usesCustomInstanceFactory() {
    GetUIQuery request =
        new GetUIQuery(
            HolaMundo.class.getName(),
            "base_url",
            "current_route",
            Map.of(),
            new FakeHttpRequest());
    var ui = useCase.handle(request).block();

    assertThat(ui).isNotNull();
    assertThat(ui.title()).isNotNull();
    assertThat(ui.title()).isEqualTo("Hola, que tal?");
  }
}
