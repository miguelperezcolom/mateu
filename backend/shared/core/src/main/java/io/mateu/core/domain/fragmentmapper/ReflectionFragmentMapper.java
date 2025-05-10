package io.mateu.core.domain.fragmentmapper;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.dtos.ActionTargetDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ContentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.SingleComponentDto;
import io.mateu.dtos.StatusDto;
import io.mateu.dtos.StatusTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Named
public class ReflectionFragmentMapper implements FragmentMapper {
  @Override
  public List<UIFragmentDto> mapToFragments(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    var fragments = new ArrayList<UIFragmentDto>();
    if (instance instanceof Form form) {
      fragments.add(mapFormToFragment(form, baseUrl, httpRequest));
    }
    return fragments;
  }

  private UIFragmentDto mapFormToFragment(Form form, String baseUrl, HttpRequest httpRequest) {
    var formDto =
        new FormDto(
            "icon",
            "title",
            false,
            "subtitle",
            new StatusDto(StatusTypeDto.SUCCESS, "message"),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            Map.of());
    ContentDto content = new SingleComponentDto("component_id");
    Map<String, ComponentDto> components =
        Map.of(
            "component_id",
            new ComponentDto(
                formDto, "component_id", form.getClass().getName(), List.of(), form, List.of()));
    return new UIFragmentDto(
        ActionTargetDto.Component,
        "initiator_component_id",
        "initiator_component_id",
        "modal_style",
        "modal_title",
        content,
        components);
  }
}
