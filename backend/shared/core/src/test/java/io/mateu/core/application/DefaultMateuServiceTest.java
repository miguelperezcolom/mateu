package io.mateu.core.application;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.uis.HelloWorld;
import com.example.uis.UsingInterfacesUI;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.domain.DefaultActionRunnerProvider;
import io.mateu.core.domain.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.DefaultUiIncrementMapperProvider;
import io.mateu.core.domain.DefaultUiMapperProvider;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.UiIncrementMapperProvider;
import io.mateu.core.domain.UiMapperProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DefaultMateuServiceTest {

  final InstanceFactoryProvider instanceFactoryProvider =
      new DefaultInstanceFactoryProvider(new FakeBeanProvider());
  final UiMapperProvider uiMapperProvider = new DefaultUiMapperProvider(new FakeBeanProvider());
  final UiIncrementMapperProvider uiIncrementMapperProvider =
      new DefaultUiIncrementMapperProvider(new FakeBeanProvider());

  final DefaultMateuService defaultMateuService =
      new DefaultMateuService(
          new GetUIUseCase(instanceFactoryProvider, uiMapperProvider),
          new RunActionUseCase(
              new FakeBeanProvider(),
              instanceFactoryProvider,
              new DefaultActionRunnerProvider(new FakeBeanProvider()),
              uiIncrementMapperProvider));

  @Test
  void getUI() {
    assertNotNull(
        defaultMateuService
            .getUI(
                HelloWorld.class.getName(),
                "base_url",
                new GetUIRqDto(Map.of(), "_hash"),
                new FakeHttpRequest())
            .block());
  }

  @Test
  void runStepAndReturn() throws Throwable {
    assertNotNull(
        defaultMateuService
            .runAction(
                UsingInterfacesUI.class.getName(),
                new RunActionRqDto(
                    Map.of(), // component state
                    Map.of(), // app state
                    Map.of(), // parameters
                    "initiator_component_id",
                    "consumed_route",
                    "action_id",
                    "route",
                    "server_side_type"),
                "base_url",
                new FakeHttpRequest())
            .blockLast());
  }
}
