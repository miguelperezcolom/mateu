package io.mateu.core.application;

import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.HelloWorld;
import com.example.uis.HelloWorldHandlingActions;
import com.example.uis.HelloWorldHandlingRoute;
import io.mateu.core.application.createjourney.CreateJourneyUseCase;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.domain.BasicTypeChecker;
import io.mateu.core.domain.DefaultActionRunnerProvider;
import io.mateu.core.domain.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.DefaultRouteMatcher;
import io.mateu.core.domain.DefaultUiIncrementMapperProvider;
import io.mateu.core.domain.DefaultUiMapperProvider;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.ReflectionUiIncrementMapper;
import io.mateu.core.domain.ReflectionUiMapper;
import io.mateu.core.domain.UiIncrementMapperProvider;
import io.mateu.core.domain.UiMapperProvider;
import io.mateu.core.domain.fragmentmapper.ReflectionFragmentMapper;
import io.mateu.core.domain.reflection.ReflectionInstanceFactory;
import io.mateu.core.domain.reflection.RunMethodActionRunner;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class FakeMateuServiceTest {

  final InstanceFactoryProvider instanceFactoryProvider =
      new DefaultInstanceFactoryProvider(
          List.of(new ReflectionInstanceFactory(new BasicTypeChecker(), new FakeBeanProvider())));
  final UiMapperProvider uiMapperProvider =
      new DefaultUiMapperProvider(List.of(new ReflectionUiMapper()));
  final UiIncrementMapperProvider uiIncrementMapperProvider =
      new DefaultUiIncrementMapperProvider(
          List.of(new ReflectionUiIncrementMapper(new ReflectionFragmentMapper())));

  final FakeMateuService fakeMateuService =
      new FakeMateuService(
          new GetUIUseCase(instanceFactoryProvider, uiMapperProvider),
          new CreateJourneyUseCase(
              instanceFactoryProvider, uiIncrementMapperProvider, new DefaultRouteMatcher()),
          new RunActionUseCase(
              instanceFactoryProvider,
              new DefaultActionRunnerProvider(List.of(new RunMethodActionRunner())),
              uiIncrementMapperProvider));

  @Test
  void getUI() {
    assertNotNull(
        fakeMateuService
            .getUI(
                HelloWorld.class.getName(),
                "base_url",
                new GetUIRqDto(Map.of(), "_hash"),
                new FakeHttpRequest())
            .block());
  }

  @Test
  void createJourney() throws Throwable {
    assertNotNull(
        fakeMateuService
            .createJourney(
                HelloWorldHandlingRoute.class.getName(),
                "base_url",
                null,
                null,
                new JourneyCreationRqDto(Map.of(), "_hash"),
                new FakeHttpRequest())
            .block());
  }

  @Test
  void runStepAndReturn() throws Throwable {
    assertNotNull(
        fakeMateuService
            .runAction(
                "component_id",
                "action_id",
                new RunActionRqDto(HelloWorldHandlingActions.class.getName(), Map.of(), Map.of()),
                "base_url",
                new FakeHttpRequest())
            .block());
  }
}
