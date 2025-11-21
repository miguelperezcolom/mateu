package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.domain.act.DefaultActionRunnerProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import org.junit.jupiter.api.Test;

class DefaultActionRunnerProviderTest {

  @Test
  void failsIfNUll() {
    var provider =
        new DefaultActionRunnerProvider(
            new FakeBeanProvider(),
            (InstanceFactoryProvider) new ReflectionInstanceFactory(new FakeBeanProvider()));
    assertThrows(
        NoSuchMethodException.class,
        () -> provider.get(null, "action_id", "consumed_route", "route", new FakeHttpRequest()));
  }

  @Test
  void failsIfNoRunnerFound() {
    var provider =
        new DefaultActionRunnerProvider(
            new FakeBeanProvider(),
            (InstanceFactoryProvider) new ReflectionInstanceFactory(new FakeBeanProvider()));
    assertThrows(
        NoSuchMethodException.class,
        () ->
            provider.get(
                "an_object", "action_id", "consumed_route", "route", new FakeHttpRequest()));
  }
}
