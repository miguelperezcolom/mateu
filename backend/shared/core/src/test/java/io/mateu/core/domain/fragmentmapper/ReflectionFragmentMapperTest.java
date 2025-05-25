package io.mateu.core.domain.fragmentmapper;

import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.apps.SimpleApp;
import com.example.uis.forms.ExtendedSimpleForm;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.FormDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.App;
import org.junit.jupiter.api.Test;

class ReflectionFragmentMapperTest {

  @Test
  void formIsMapped() {
    var mapper = new ReflectionFragmentMapper();
    var fragments =
        mapper.mapToFragments(
            new ExtendedSimpleForm(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertEquals(1, fragments.size());
    var fragment = fragments.get(0);
    assertNotNull(fragment);
    assertEquals(1, fragments.size());
    assertTrue(fragments.get(0).component().metadata() instanceof FormDto);
  }

  @Test
  void appIsMapped() {
    var mapper = new ReflectionFragmentMapper();
    var fragments =
        mapper.mapToFragments(
            new SimpleApp(), "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertEquals(1, fragments.size());
    var fragment = fragments.get(0);
    assertNotNull(fragment);
  }

  @Route("/app.*")
  class MyApp implements App {}

  @Test
  void minimalMatchingRouteIsReturned() {
    var mapper = new ReflectionFragmentMapper();
    var appRoute = mapper.getRoute(new MyApp(), new FakeHttpRequest(), "/app/home");
    assertNotNull(appRoute);
    assertEquals("/app", appRoute);
  }
}
