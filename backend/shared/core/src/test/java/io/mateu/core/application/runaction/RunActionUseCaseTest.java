package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.helpers.Mocks.createBeans;

import io.mateu.core.domain.BeanProvider;
import io.mateu.core.domain.DefaultActionRunnerProvider;
import io.mateu.core.domain.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.DefaultUiIncrementMapperProvider;

class RunActionUseCaseTest {

  final BeanProvider beanProvider = createBeans();

  final RunActionUseCase useCase =
      new RunActionUseCase(
          beanProvider,
          new DefaultInstanceFactoryProvider(beanProvider),
          new DefaultActionRunnerProvider(beanProvider),
          new DefaultUiIncrementMapperProvider(beanProvider));
}
