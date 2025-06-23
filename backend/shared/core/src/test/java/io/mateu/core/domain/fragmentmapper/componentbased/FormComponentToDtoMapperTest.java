package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.Test;

class FormComponentToDtoMapperTest {

  @Test
  void mapsToFormDto() {
    var supplier =
        new FormSupplier() {

          String name = "Mateu";
          int age = 17;

          @Override
          public Form getForm(HttpRequest httpRequest) {
            return Form.builder() // vertical layout as default container for children
                .id("form_id")
                .title("title")
                .subtitle("subtitle")
                .pageTitle("page_title")
                .favicon("favicon")
                .actions(
                    List.of( // not required, as we can set the actionable when declaring the
                        // buttons
                        Action.builder().id("action_id").build()))
                .triggers(List.of(new OnLoadTrigger("action_id")))
                .toolbar(
                    List.of(
                        Button.builder().label("Button 1").actionId("action_id").build(),
                        Button.builder().label("Button 2").actionId("action_id").build()))
                .buttons(List.of(Button.builder().label("Button 3").actionId("action_id").build()))
                .header(List.of()) // will be placed in header, below title, subtitle and toolbar
                .content(
                    List.of(
                        FormLayout.builder()
                            .id("form_layout_id")
                            .content(
                                List.of(
                                    Field.builder()
                                        .id("name")
                                        .label("Name")
                                        .dataType(FieldDataType.string)
                                        .required(true)
                                        .description("description")
                                        .placeholder("placeholder")
                                        .cssClasses("css_classes")
                                        .build(),
                                    Field.builder()
                                        .id("age")
                                        .label("Age")
                                        .dataType(FieldDataType.integer)
                                        .required(false)
                                        .build()))
                            .build()))
                .footer(List.of()) // will be placed in footer, between left and right side buttons
                .build();
          }
        };
    var expected =
        UIFragmentDto.builder()
            .targetComponentId("initiator")
            .component(
                new ComponentDto(
                    FormDto.builder()
                        .subtitle("subtitle")
                        .title("title")
                        .actions(List.of(ActionDto.builder().id("action_id").build()))
                        .triggers(List.of(new OnLoadTriggerDto("action_id", 0, 1)))
                        .toolbar(
                            List.of(
                                ButtonDto.builder()
                                    .id(null)
                                    .label("Button 1")
                                    .actionId("action_id")
                                    .build(),
                                ButtonDto.builder()
                                    .id(null)
                                    .label("Button 2")
                                    .actionId("action_id")
                                    .build()))
                        .buttons(
                            List.of(
                                ButtonDto.builder()
                                    .id(null)
                                    .label("Button 3")
                                    .actionId("action_id")
                                    .build()))
                        .build(),
                    "form_id",
                    supplier.getClass().getName(),
                    List.of(
                        new ComponentDto(
                            FormLayoutDto.builder().build(),
                            "form_layout_id",
                            null,
                            List.of(
                                new ComponentDto(
                                    new FormFieldDto(
                                        "name",
                                        "string",
                                        "regular",
                                        false,
                                        false,
                                        "Name",
                                        "placeholder",
                                        "css_classes",
                                        "description",
                                        List.of(),
                                        List.of(),
                                        List.of(),
                                        0,
                                        false,
                                        false,
                                        List.of()),
                                    "name",
                                    null,
                                    List.of()),
                                new ComponentDto(
                                    new FormFieldDto(
                                        "age", "integer", "regular", false, false, "Age", null,
                                        null, null, List.of(), List.of(), List.of(), 0, false,
                                        false, List.of()),
                                    "age",
                                    null,
                                    List.of()))))))
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
    assertThat(dto).usingRecursiveComparison().isEqualTo(expected);
  }
}
