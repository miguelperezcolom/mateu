package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.domain.act.DefaultActionRunnerProvider;
import io.mateu.core.domain.in.DefaultInstanceFactoryProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import org.junit.jupiter.api.Test;

class DefaultActionRunnerProviderTest {

  @Test
  void failsIfNUll() {
    var provider =
        new DefaultActionRunnerProvider(
            new FakeBeanProvider(), new DefaultInstanceFactoryProvider(new FakeBeanProvider()));
    assertThrows(
        NoSuchMethodException.class,
        () -> provider.get(null, "action_id", "consumed_route", "route", new FakeHttpRequest()));
  }

  @Test
  void returnsFallbackRunnerIfNoRunnerFound() {
    var provider =
        new DefaultActionRunnerProvider(
            new FakeBeanProvider(), new DefaultInstanceFactoryProvider(new FakeBeanProvider()));
    // No longer throws - returns a fallback runner instead
    assertDoesNotThrow(
        () ->
            provider.get(
                "an_object", "action_id", "consumed_route", "route", new FakeHttpRequest()));
    var runner =
        assertDoesNotThrow(
            () ->
                provider.get(
                    "an_object", "action_id", "consumed_route", "route", new FakeHttpRequest()));
    assertNotNull(runner);
  }
}
