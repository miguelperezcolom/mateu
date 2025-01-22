package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.getui.GetUIRequest;
import io.mateu.core.application.getui.GetUIUseCase;
import org.junit.jupiter.api.Test;

public class GetUIUseCaseTest {

  @Test
  void returnsUI() {
    var useCase = new GetUIUseCase();

    GetUIRequest request = new GetUIRequest("");
    var ui = useCase.handle(request).block();

    assertThat(ui).isNull();
  }
}
