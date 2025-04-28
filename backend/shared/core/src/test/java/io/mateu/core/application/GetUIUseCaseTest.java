package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.ui.HelloWorld;
import com.example.ui.dynamic.DynamicHelloWorld;
import io.mateu.core.application.getui.GetUIQuery;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.domain.BasicTypeChecker;
import io.mateu.core.domain.ReflectionInstanceFactory;
import io.mateu.core.domain.ReflectionUiMapper;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import org.junit.jupiter.api.Test;

import java.util.List;

class GetUIUseCaseTest {

  @Test
  void returnsUI() {
    var useCase =
        new GetUIUseCase(
            new ReflectionInstanceFactory(new BasicTypeChecker(), new FakeBeanProvider()),
            new ReflectionUiMapper());

    for (var type : List.of(DynamicHelloWorld.class, HelloWorld.class)) {
      GetUIQuery request =
              new GetUIQuery(type.getName(), "base_url", new FakeHttpRequest());
      var ui = useCase.handle(request).block();

      assertThat(ui).isNotNull();
      assertThat(ui.icon()).isNull();
      assertThat(ui.logo()).isNull();
      assertThat(ui.favIcon()).isNull();
      assertThat(ui.contextData()).isNull();
      assertThat(ui.title()).isEqualTo("Hello world");
      assertThat(ui.apps()).isEmpty();
      assertThat(ui.loginUrl()).isNull();
      assertThat(ui.logoutUrl()).isNull();
      assertThat(ui.menu()).isEmpty();
      assertThat(ui.subtitle()).isNull();

    }

  }
}
