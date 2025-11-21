package io.mateu.core.application;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.uis.UsingInterfacesUI;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.domain.act.DefaultActionRunnerProvider;
import io.mateu.core.domain.in.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.out.DefaultUiIncrementMapperProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DefaultMateuServiceTest {

  final InstanceFactoryProvider instanceFactoryProvider =
      new DefaultInstanceFactoryProvider(new FakeBeanProvider());
  final UiIncrementMapperProvider uiIncrementMapperProvider =
      new DefaultUiIncrementMapperProvider(new FakeBeanProvider());

  final DefaultMateuService defaultMateuService =
      new DefaultMateuService(
          new RunActionUseCase(
              new FakeBeanProvider(),
              instanceFactoryProvider,
              new DefaultActionRunnerProvider(
                  new FakeBeanProvider(),
                  (InstanceFactoryProvider) new ReflectionInstanceFactory(new FakeBeanProvider())),
              uiIncrementMapperProvider));

  @Test
  void runStepAndReturn() throws Throwable {
    var rq =
        new RunActionRqDto(
            Map.of(), // component state
            Map.of(), // app state
            Map.of(), // parameters
            "initiator_component_id",
            "consumed_route",
            "action_id",
            "route",
            UsingInterfacesUI.class.getName(),
            "");
    assertNotNull(
        defaultMateuService
            .runAction(
                UsingInterfacesUI.class.getName(),
                rq,
                "base_url",
                new FakeHttpRequest().storeRunActionRqDto(rq))
            .blockLast());
  }
}
