package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.helpers.Mocks.createBeans;

import io.mateu.core.application.DefaultRoutedClassResolver;
import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.domain.act.DefaultActionRunnerProvider;
import io.mateu.core.domain.in.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.out.DefaultUiIncrementMapperProvider;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import java.util.List;

abstract class RunActionUseCaseTest {

  final BeanProvider beanProvider = createBeans();
  final InstanceFactoryProvider instanceFactoryProvider =
      new InstanceFactoryProvider() {
        @Override
        public InstanceFactory get(String className) {
          return new ReflectionInstanceFactory(new FakeBeanProvider());
        }
      };
  final RoutedClassResolver routedClassResolver = new DefaultRoutedClassResolver(List.of());

  final RunActionUseCase useCase =
      new RunActionUseCase(
          beanProvider,
          new DefaultInstanceFactoryProvider(beanProvider),
          new DefaultActionRunnerProvider(beanProvider, instanceFactoryProvider),
          new DefaultUiIncrementMapperProvider(beanProvider),
          routedClassResolver,
          null);
}
