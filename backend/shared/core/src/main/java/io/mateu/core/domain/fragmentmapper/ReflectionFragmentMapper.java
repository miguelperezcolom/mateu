package io.mateu.core.domain.fragmentmapper;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.StatusDto;
import io.mateu.dtos.StatusTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.ArrayList;
import java.util.List;

@Named
public class ReflectionFragmentMapper implements FragmentMapper {
  @Override
  public List<UIFragmentDto> mapToFragments(
      Object instance, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    var fragments = new ArrayList<UIFragmentDto>();
    if (instance instanceof Form form) {
      fragments.add(mapFormToFragment(form, baseUrl, initiatorComponentId, httpRequest));
    }
    return fragments;
  }

  private UIFragmentDto mapFormToFragment(
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
            List.of(),
            List.of(),
            List.of(),
            List.of(),
            List.of());
    var component = new ComponentDto(formDto, "component_id", form.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, form);
  }

  private String getTitle(Form form) {
    if (form instanceof HasTitle hasTitle) {
      return hasTitle.getTitle();
    }
    return null;
  }

  private String getSubtitle(Form form) {
    if (form instanceof HasSubtitle hasSubtitle) {
      return hasSubtitle.getSubtitle();
    }
    return null;
  }
}
