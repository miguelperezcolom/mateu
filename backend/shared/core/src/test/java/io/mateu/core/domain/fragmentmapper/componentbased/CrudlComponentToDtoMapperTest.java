package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ColumnDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Column;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.CrudlSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.Test;

class CrudlComponentToDtoMapperTest {

  @Test
  void mapsToCrudlDto() {
    var supplier =
        new CrudlSupplier() {

          String name = "Mateu";
          int age = 17;

          @Override
          public Crudl getCrudl(HttpRequest httpRequest) {
            return Crudl.builder() // vertical layout as default container for children
                .id("crudl_id")
                .title("title")
                .subtitle("subtitle")
                .pageTitle("page_title")
                .favicon("favicon")
                .actions(
                    List.of( // not required, as we can set the actionable when declaring the
                        // buttons
                        Action.builder().id("action_id").build()))
                .triggers(List.of(new OnLoadTrigger("action_id")))
                .filters(
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
                .toolbar(
                    List.of(
                        Button.builder().label("Button 1").actionId("action_id").build(),
                        Button.builder().label("Button 2").actionId("action_id").build()))
                .columns(
                    List.of(
                        Column.builder()
                            .id("name")
                            .label("Name")
                            .dataType(FieldDataType.string)
                            .build(),
                        Column.builder()
                            .id("age")
                            .label("Age")
                            .dataType(FieldDataType.integer)
                            .build()))
                .build();
          }
        };
    var expected =
        UIFragmentDto.builder()
            .targetComponentId("initiator")
            .component(
                new ComponentDto(
                    CrudlDto.builder()
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
                        .columns(
                            List.of(
                                ColumnDto.builder()
                                    .id("name")
                                    .header("Name")
                                    .dataType("string")
                                    .build(),
                                ColumnDto.builder()
                                    .id("age")
                                    .header("Age")
                                    .dataType("integer")
                                    .build()))
                        .filters(
                            List.of(
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
                                new FormFieldDto(
                                    "age", "integer", "regular", false, false, "Age", null, null,
                                    null, List.of(), List.of(), List.of(), 0, false, false,
                                    List.of())))
                        .build(),
                    "crudl_id",
                    supplier.getClass().getName(),
                    List.of()))
            .data(supplier)
            .build();
    var dto =
        mapComponentToFragment(
            supplier,
            supplier.getCrudl(new FakeHttpRequest()),
            "base_url",
            "route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
    assertThat(dto).usingRecursiveComparison().isEqualTo(expected);
  }
}
