package io.mateu.core.domain.fragmentmapper.componentbased;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class FormComponentToDtoMapperTest {

  @Test
  void mapsToFormDto() {
    var supplier =
        new FormSupplier() {
          @Override
          public Form getForm(HttpRequest httpRequest) {
            return Form.builder()
                .title("title")
                .subtitle("subtitle")
                .pageTitle("page_title")
                .favicon("favicon")
                .actions(List.of(

                ))
                .content(List.of())
                .build();
          }
        };
      var expected = UIFragmentDto.builder()
              .targetComponentId("initiator")
              .component(new ComponentDto(
                      FormDto.builder()
                              .subtitle("subtitle")
                              .title("title")
                              .build(),
                      "component_id",
                      supplier.getClass().getName(),
                      List.of()
              ))
              .data(supplier)
              .build();
    var dto =
        mapComponentToFragment(
            supplier,
            supplier.getForm(new FakeHttpRequest()),
            "base_url",
            "route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
      assertThat(dto)
              .usingRecursiveComparison()
              .isEqualTo(expected);
  }

}
