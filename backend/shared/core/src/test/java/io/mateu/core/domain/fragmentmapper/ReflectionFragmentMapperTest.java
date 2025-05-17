package io.mateu.core.domain.fragmentmapper;

import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeHttpRequest;
import org.junit.jupiter.api.Test;

class ReflectionFragmentMapperTest {

  @Test
  void formIsMapped() {

    var mapper = new ReflectionFragmentMapper();
    var fragments =
        mapper.mapToFragments(
            new SimpleForm(), "base_url", "initiator_component_id", new FakeHttpRequest());
    assertEquals(1, fragments.size());
    var fragment = fragments.get(0);
    assertNotNull(fragment);
  }
}
