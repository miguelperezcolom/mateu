package io.mateu.core.application.getui;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.HelloWorld;
import com.example.uis.HolaMundo;
import com.example.uis.dynamic.DynamicHelloWorld;
import io.mateu.core.domain.BasicTypeChecker;
import io.mateu.core.domain.BeanProvider;
import io.mateu.core.domain.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.DefaultUiMapperProvider;
import io.mateu.core.domain.reflection.ReflectionInstanceFactory;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import java.util.Collection;
import java.util.List;
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
                      List.of(
                          new ReflectionInstanceFactory(
                              new BasicTypeChecker(), new FakeBeanProvider()));
                }
              }),
          new DefaultUiMapperProvider(new FakeBeanProvider()));

  @Test
  void returnsUI() {

    for (var type : List.of(DynamicHelloWorld.class, HelloWorld.class)) {
      GetUIQuery request = new GetUIQuery(type.getName(), "base_url", new FakeHttpRequest());
      var ui = useCase.handle(request).block();

      assertThat(ui).isNotNull();
      assertThat(ui.favIcon()).isNull();
      assertThat(ui.title()).isEqualTo("Hello world");
    }
  }

  @Test
  void usesCustomInstanceFactory() {
    GetUIQuery request =
        new GetUIQuery(HolaMundo.class.getName(), "base_url", new FakeHttpRequest());
    var ui = useCase.handle(request).block();

    assertThat(ui).isNotNull();
    assertThat(ui.title()).isNotNull();
    assertThat(ui.title()).isEqualTo("Hola, que tal?");
  }
}
