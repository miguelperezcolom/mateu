package io.mateu.core.domain.fragmentmapper.reflectionbased;

import static io.mateu.core.domain.Humanizer.capitalize;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionCommonMapper.getSubtitle;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionCommonMapper.getTitle;
import static io.mateu.core.domain.reflection.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.domain.reflection.AllMethodsProvider.getAllMethods;
import static io.mateu.core.domain.reflection.ValueProvider.getValue;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class ReflectionFormMapper {

  public static UIFragmentDto mapFormToFragment(
      Form form, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    var formDto =
        FormDto.builder()
            .icon("icon")
            .title(getTitle(form))
            .subtitle(getSubtitle(form))
            .actions(createActions(form))
            .build();
    var component =
        new ServerSideComponentDto(
            UUID.randomUUID().toString(),
            form.getClass().getName(),
            List.of(new ClientSideComponentDto(formDto, "", createFormContent(form), "", "", null)),
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

  private static List<ComponentDto> createFormContent(Form form) {
    var formLayout = FormLayoutDto.builder().build();
    return List.of(new ClientSideComponentDto(formLayout, "", createFields(form), "", "", null));
  }

  private static List<ComponentDto> createFields(Form form) {
    return getAllEditableFields(form.getClass()).stream()
        .map(
            field ->
                (ComponentDto)
                    new ClientSideComponentDto(
                        new FormFieldDto(
                            field.getName(),
                            "string",
                            "stereotype",
                            false,
                            false,
                            capitalize(field.getName()),
                            "placeholder",
                            "css_classes",
                            "description",
                            List.of(),
                            List.of(),
                            0,
                            false,
                            false,
                            List.of(),
                            getValue(field, form),
                            false),
                        "field_id",
                        List.of(),
                        "",
                        "",
                        null))
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
