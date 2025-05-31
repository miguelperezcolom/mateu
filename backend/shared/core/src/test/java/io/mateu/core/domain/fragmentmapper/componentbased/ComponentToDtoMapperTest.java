package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.Test;

class ComponentToDtoMapperTest {

  @Test
  void mapsToElement() {
    var dto =
        mapComponentToFragment(
            null,
            new TextComponent("Hola"),
            "base_url",
            "route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
  }

  @Test
  void mapsToForm() {
    var supplier =
        new FormSupplier() {
          @Override
          public Form getForm(HttpRequest httpRequest) {
            return Form.builder()
                .title("title")
                .subtitle("subtitle")
                .pageTitle("page_title")
                .favicon("favicon")
                .actions(List.of())
                .content(List.of())
                .build();
          }
        };
    var dto =
        mapComponentToFragment(
            supplier,
            supplier.getForm(new FakeHttpRequest()),
            "base_url",
            "route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
  }
}
