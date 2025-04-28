package io.mateu.core.application.runaction;

import com.example.components.AnnotatedComponent;
import com.example.components.UsingInterfacesComponent;
import com.example.uis.HelloWorld;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.domain.*;
import io.mateu.core.domain.reflection.ReflectionInstanceFactory;
import io.mateu.core.domain.reflection.RunMethodActionRunner;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RunActionUseCaseTest {

    final RunActionUseCase useCase =
            new RunActionUseCase(
                    new DefaultInstanceFactoryProvider(List.of
                            (new ReflectionInstanceFactory(new BasicTypeChecker(), new FakeBeanProvider()))),
                    new DefaultActionRunnerProvider(List.of(
                            new RunMethodActionRunner()
                    )),
                    new ReflectionUiIncrementMapper());

    @Test
    void runsMethod() {
        for (var componentType : List.of(AnnotatedComponent.class, UsingInterfacesComponent.class)) {
            var increment = useCase.handle(new RunActionCommand(
                    "base_url",
                    "component_id",
                    "sayHello",
                    componentType.getName(),
                    Map.of(),
                    Map.of(),
                    new FakeHttpRequest()
                    )).block();
            assertThat(increment).isNotNull();
        }
    }

}