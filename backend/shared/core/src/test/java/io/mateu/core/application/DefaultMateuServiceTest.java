package io.mateu.core.application;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.example.uis.UsingInterfacesUI;
import io.mateu.core.application.runaction.AppMenuResolver;
import io.mateu.core.application.runaction.CrudNavigationAdjuster;
import io.mateu.core.application.runaction.RouteInstanceCreator;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.domain.act.DefaultActionRunnerProvider;
import io.mateu.core.domain.in.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.out.DefaultUiIncrementMapperProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DefaultMateuServiceTest {

  final FakeBeanProvider beanProvider = new FakeBeanProvider();
  final InstanceFactoryProvider instanceFactoryProvider =
      new DefaultInstanceFactoryProvider(beanProvider);
  final UiIncrementMapperProvider uiIncrementMapperProvider =
      new DefaultUiIncrementMapperProvider(beanProvider);
  final RoutedClassResolver routedClassResolver = new DefaultRoutedClassResolver(List.of());
  final AppMenuResolver appMenuResolver =
      new AppMenuResolver(beanProvider, instanceFactoryProvider, null, List.of());

  final DefaultMateuService defaultMateuService =
      new DefaultMateuService(
          new RunActionUseCase(
              instanceFactoryProvider,
              new DefaultActionRunnerProvider(beanProvider, instanceFactoryProvider),
              uiIncrementMapperProvider,
              new CrudNavigationAdjuster(),
              new RouteInstanceCreator(
                  routedClassResolver, instanceFactoryProvider, List.of(), appMenuResolver),
              appMenuResolver));

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
