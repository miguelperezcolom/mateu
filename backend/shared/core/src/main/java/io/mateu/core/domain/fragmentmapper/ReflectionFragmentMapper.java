package io.mateu.core.domain.fragmentmapper;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.core.domain.Humanizer;
import io.mateu.core.domain.reflection.AllMethodsProvider;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ActionPositionDto;
import io.mateu.dtos.ActionStereotypeDto;
import io.mateu.dtos.ActionTargetDto;
import io.mateu.dtos.ActionTypeDto;
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
import io.mateu.uidl.annotations.Action;
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

  private final AllMethodsProvider allMethodsProvider = new AllMethodsProvider();

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
            createActions(form),
            List.of(),
            List.of(),
            List.of());
    var component = new ComponentDto(formDto, "component_id", form.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, form);
  }

  private List<ActionDto> createActions(Form form) {
    List<ActionDto> actions = new ArrayList<>();
    actions.addAll(
        allMethodsProvider.getAllMethods(form.getClass()).stream()
            .filter(method -> method.isAnnotationPresent(Action.class))
            .map(
                method ->
                    new ActionDto(
                        method.getName(),
                        "icon",
                        Humanizer.capitalize(method.getName()),
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
                      true,
                      menu.selected()))
          .toList();
    }
    return List.of();
  }
}
