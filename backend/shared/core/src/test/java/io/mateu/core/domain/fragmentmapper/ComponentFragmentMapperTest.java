package io.mateu.core.domain.fragmentmapper;

import static org.junit.jupiter.api.Assertions.*;

import com.example.fluent.SampleAppProvider;
import com.example.fluent.SamplePageProvider;
import io.mateu.core.domain.fragmentmapper.componentbased.ComponentAppMapper;
import io.mateu.core.domain.fragmentmapper.componentbased.ComponentPageMapper;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.UIFragmentDto;
import org.junit.jupiter.api.Test;

class ComponentFragmentMapperTest {

  @Test
  void constructorsWork() {
    assertNotNull(new ComponentAppMapper());
    assertNotNull(new ComponentPageMapper());
  }

  @Test
  void stringPassesThrough() {
    var mapper = new ComponentFragmentMapper();
    Object fragment =
        mapper.mapToFragment(
            "hola!", "base_url", "route", "initiator_component_id", new FakeHttpRequest());
    assertNotNull(fragment);
    assertEquals("hola!", fragment);
  }

  @Test
  void formIsMapped() {
    var mapper = new ComponentFragmentMapper();
    UIFragmentDto fragment =
        (UIFragmentDto)
            mapper.mapToFragment(
                new SamplePageProvider(),
                "base_url",
                "route",
                "initiator_component_id",
                new FakeHttpRequest());
    assertNotNull(fragment);
    assertTrue(fragment.component().metadata() instanceof PageDto);
  }

  @Test
  void appIsMapped() {
    var mapper = new ComponentFragmentMapper();
    var fragment =
        mapper.mapToFragment(
            new SampleAppProvider(),
            "base_url",
            "route",
            "initiator_component_id",
            new FakeHttpRequest());
    assertNotNull(fragment);
  }
}
