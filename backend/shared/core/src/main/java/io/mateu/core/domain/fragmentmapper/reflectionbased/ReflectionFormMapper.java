package io.mateu.core.domain.fragmentmapper.reflectionbased;

import static io.mateu.core.domain.Humanizer.capitalize;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionCommonMapper.getSubtitle;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionCommonMapper.getTitle;
import static io.mateu.core.domain.reflection.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.domain.reflection.AllMethodsProvider.getAllMethods;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ActionPositionDto;
import io.mateu.dtos.ActionStereotypeDto;
import io.mateu.dtos.ActionTargetDto;
import io.mateu.dtos.ActionTypeDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.StatusDto;
import io.mateu.dtos.StatusTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public final class ReflectionFormMapper {

  public static UIFragmentDto mapFormToFragment(
      Form form, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    var formDto =
        new FormDto(
            "icon",
            getTitle(form),
            false,
            getSubtitle(form),
            new StatusDto(StatusTypeDto.SUCCESS, "message"),
            List.of(),
            List.of(),
            createActions(form),
            List.of(),
            List.of(),
            List.of());
    var component =
        new ComponentDto(
            formDto, "component_id", form.getClass().getName(), createFormContent(form));
    return new UIFragmentDto(initiatorComponentId, component, form);
  }

  private static List<ComponentDto> createFormContent(Form form) {
    var formLayout = new FormLayoutDto();
    return List.of(new ComponentDto(formLayout, "", null, createFields(form)));
  }

  private static List<ComponentDto> createFields(Form form) {
    return getAllEditableFields(form.getClass()).stream()
        .map(
            field ->
                new ComponentDto(
                    new FormFieldDto(
                        field.getName(),
                        "string",
                        "stereootype",
                        false,
                        false,
                        capitalize(field.getName()),
                        "placeholder",
                        "css_classes",
                        "description",
                        List.of(),
                        List.of(),
                        List.of(),
                        0,
                        false,
                        false),
                    "field_id",
                    null,
                    List.of()))
        .toList();
  }

  private static List<ActionDto> createActions(Form form) {
    List<ActionDto> actions = new ArrayList<>();
    actions.addAll(
        getAllMethods(form.getClass()).stream()
            .filter(method -> method.isAnnotationPresent(Action.class))
            .map(
                method ->
                    new ActionDto(
                        method.getName(),
                        "icon",
                        capitalize(method.getName()),
                        ActionTypeDto.Primary,
                        ActionStereotypeDto.valueOf(
                            method.getAnnotation(Action.class).type().name()),
                        null,
                        true,
                        false,
                        false,
                        false,
                        null,
                        ActionTargetDto.Component,
                        null,
                        null,
                        null,
                        null,
                        false,
                        ActionPositionDto.Left,
                        0,
                        0))
            .toList());
    return actions;
  }
}
