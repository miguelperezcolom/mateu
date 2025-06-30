package io.mateu.core.domain.fragmentmapper;

import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.apps.SimpleApp;
import com.example.uis.forms.ExtendedSimpleForm;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.App;
import org.junit.jupiter.api.Test;

class ReflectionFragmentMapperTest {

  @Test
  void formIsMapped() {
    var mapper = new ReflectionFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            new ExtendedSimpleForm(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
    assertInstanceOf(ServerSideComponentDto.class, fragment.component());
  }

  @Test
  void appIsMapped() {
    var mapper = new ReflectionFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            new SimpleApp(), "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertNotNull(fragment);
  }

  @Route("/app.*")
  class MyApp implements App {}

  @Test
  void minimalMatchingRouteIsReturned() {
    var appRoute = getRoute(new MyApp(), new FakeHttpRequest(), "/app/home");
    assertNotNull(appRoute);
    assertEquals("/app", appRoute);
  }

  @Test
  void fragmentPassesThrough() {
    var mapper = new ReflectionFragmentMapper();
    var fragment = UIFragmentDto.builder().build();
    var mapped =
        mapper.mapToFragment(
            fragment, "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertEquals(fragment, mapped);
  }
}
