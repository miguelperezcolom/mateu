package io.mateu.core.domain.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.apps.SimpleApp;
import com.example.uis.forms.ExtendedSimpleForm;
import io.mateu.core.domain.out.fragmentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.App;
import org.junit.jupiter.api.Test;

class ReflectionFragmentMapperTest {

  @Test
  void formIsMapped() {
    var mapper = new ReflectionObjectToComponentMapper();
    var fragment =
        mapper.mapToComponent(
            new ExtendedSimpleForm(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
    assertInstanceOf(Component.class, fragment);
  }

  @Test
  void appIsMapped() {
    var mapper = new ReflectionObjectToComponentMapper();
    var fragment =
        mapper.mapToComponent(
            new SimpleApp(), "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Route("/app.*")
  class MyApp implements App {}

  @Test
  void minimalMatchingRouteIsReturned() {
    var app = new MyApp();
    var appRoute = getRoute(app, app, new FakeHttpRequest(), "/app/home");
    assertNotNull(appRoute);
    assertEquals("/app", appRoute);
  }

  @Test
  void fragmentPassesThrough() {
    var mapper = new ReflectionObjectToComponentMapper();
    var fragment = UIFragmentDto.builder().build();
    var mapped =
        mapper.mapToComponent(
            fragment, "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertEquals(fragment, mapped);
  }
}
