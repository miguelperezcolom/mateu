package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.ui.HelloWorld;
import io.mateu.core.application.getui.GetUIQuery;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.domain.BasicTypeChecker;
import io.mateu.core.domain.ReflectionInstanceFactory;
import io.mateu.core.domain.ReflectionUiMapper;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import org.junit.jupiter.api.Test;

class GetUIUseCaseTest {

  @Test
  void returnsUI() {
    var useCase = new GetUIUseCase(
            new ReflectionInstanceFactory(new BasicTypeChecker(), new FakeBeanProvider()),
            new ReflectionUiMapper());

    GetUIQuery request = new GetUIQuery(HelloWorld.class.getName(), "base_url", new FakeHttpRequest());
    var ui = useCase.handle(request).block();

    assertThat(ui).isNotNull();

  }
}
