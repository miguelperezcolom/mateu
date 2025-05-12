package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeBeanProvider;
import org.junit.jupiter.api.Test;

class DefaultActionRunnerProviderTest {

  @Test
  void failsIfNUll() {
    var provider = new DefaultActionRunnerProvider(new FakeBeanProvider());
    assertThrows(NoSuchMethodException.class, () -> provider.get(null, "action_id"));
  }

  @Test
  void failsIfNoRunnerFound() {
    var provider = new DefaultActionRunnerProvider(new FakeBeanProvider());
    assertThrows(NoSuchMethodException.class, () -> provider.get("an_object", "action_id"));
  }
}
