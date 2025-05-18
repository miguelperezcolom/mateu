package io.mateu.core.domain.fragmentmapper;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.dtos.MenuTypeDto;
import io.mateu.dtos.StatusDto;
import io.mateu.dtos.StatusTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasMenu;
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
    if (instance instanceof App app) {
      fragments.add(mapAppToFragment(app, baseUrl, initiatorComponentId, httpRequest));
    }
    return fragments;
  }

  private UIFragmentDto mapAppToFragment(
      App app, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    var appDto =
        new AppDto(
            AppVariantDto.TABS,
            "icon",
            "logo",
            getTitle(app),
            getSubtitle(app),
            getMenu(app),
            "/home",
            "login_url",
            "welcome_message",
            "logout_url",
            List.of());
    var component = new ComponentDto(appDto, "component_id", app.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, app);
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

  private String getTitle(Object instance) {
    if (instance instanceof HasTitle hasTitle) {
      return hasTitle.getTitle();
    }
    return null;
  }

  private String getSubtitle(Object instance) {
    if (instance instanceof HasSubtitle hasSubtitle) {
      return hasSubtitle.getSubtitle();
    }
    return null;
  }

  private List<MenuDto> getMenu(Object instance) {
    if (instance instanceof HasMenu hasMenu) {
      return hasMenu.createMenu().stream()
          .map(
              menu ->
                  new MenuDto(
                      MenuTypeDto.MenuOption,
                      "icon",
                      menu.label(),
                      new GoToRouteDto("", menu.destination().route(), ""),
                      List.of(),
                      0,
                      true))
          .toList();
    }
    return List.of();
  }
}
