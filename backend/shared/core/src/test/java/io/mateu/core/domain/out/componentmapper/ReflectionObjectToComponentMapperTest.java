package io.mateu.core.domain.out.componentmapper;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Page;
import org.junit.jupiter.api.Test;

class ReflectionObjectToComponentMapperTest {

  class FakeApp implements App {}

  class FakePage implements Page {}

  @Test
  void appIsReturned() {
    ReflectionObjectToComponentMapper mapper = new ReflectionObjectToComponentMapper();
    var result =
        mapper.mapToComponent(
            new FakeApp(),
            "base_url",
            "route",
            "consumed_route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(result);
    assertInstanceOf(io.mateu.uidl.fluent.App.class, result);
  }

  @Test
  void pageIsReturned() {
    ReflectionObjectToComponentMapper mapper = new ReflectionObjectToComponentMapper();
    var result =
        mapper.mapToComponent(
            new FakePage(),
            "base_url",
            "route",
            "consumed_route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(result);
    assertInstanceOf(io.mateu.uidl.fluent.Page.class, result);
  }
}
