package io.mateu.core.domain.out.fragmentmapper.reflectionbased;

import static io.mateu.core.domain.Humanizer.capitalize;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FieldComponentToDtoMapper.mapFormFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionCommonMapper.getSubtitle;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionCommonMapper.getTitle;
import static io.mateu.core.infra.reflection.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.AllMethodsProvider.getAllMethods;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class ReflectionFormMapper {

  public static UIFragmentDto mapFormToFragment(
      Object form,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var formDto =
        FormDto.builder()
            .icon("icon")
            .title(getTitle(form))
            .subtitle(getSubtitle(form))
            .actions(createActions(form))
            .toolbar(createToolbar(form))
            .buttons(createButtons(form))
            .build();
    var component =
        new ServerSideComponentDto(
            UUID.randomUUID().toString(),
            form.getClass().getName(),
            List.of(
                new ClientSideComponentDto(
                    formDto,
                    "",
                    createFormContent(form, baseUrl, route, httpRequest),
                    "",
                    "",
                    null)),
            form,
            "",
            "",
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            null);
    return new UIFragmentDto(
        initiatorComponentId, component, form, null, UIFragmentActionDto.Replace);
  }

  private static List<ButtonDto> createButtons(Object form) {
    List<ButtonDto> buttons = new ArrayList<>();
    buttons.addAll(
        getAllMethods(form.getClass()).stream()
            .filter(method -> method.isAnnotationPresent(Action.class))
            .map(
                method ->
                    new ButtonDto(
                        capitalize(method.getName()),
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        false,
                        false,
                        method.getName(),
                        null))
            .toList());

    return buttons;
  }

  private static List<ButtonDto> createToolbar(Object form) {
    return List.of();
  }

  private static List<ComponentDto> createFormContent(
      Object form, String baseUrl, String route, HttpRequest httpRequest) {
    var formLayout = FormLayoutDto.builder().build();
    return List.of(
        new ClientSideComponentDto(
            formLayout, "", createFields(form, baseUrl, route, httpRequest), "", "", null));
  }

  private static List<ComponentDto> createFields(
      Object form, String baseUrl, String route, HttpRequest httpRequest) {
    return getAllEditableFields(form.getClass()).stream()
        .map(
            field ->
                FormField.builder()
                    .id(field.getName())
                    .dataType(getDataType(field))
                    .label(getLabel(field))
                    .build())
        .map(formField -> (ComponentDto) mapFormFieldToDto(formField, baseUrl, route, httpRequest))
        .toList();
  }

  private static String getLabel(Field field) {
    return capitalize(field.getName());
  }

  private static FieldDataType getDataType(Field field) {
    return FieldDataType.string;
  }

  private static List<ActionDto> createActions(Object form) {
    List<ActionDto> actions = new ArrayList<>();
    actions.addAll(
        getAllMethods(form.getClass()).stream()
            .filter(method -> method.isAnnotationPresent(Action.class))
            .map(
                method ->
                    new ActionDto(
                        method.getName(),
                        false,
                        false,
                        false,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        false,
                        false))
            .toList());
    return actions;
  }
}
