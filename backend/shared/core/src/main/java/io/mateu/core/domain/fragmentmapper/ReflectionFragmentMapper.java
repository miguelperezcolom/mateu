package io.mateu.core.domain.fragmentmapper;

import static io.mateu.core.domain.Humanizer.capitalize;
import static io.mateu.core.domain.reflection.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.domain.reflection.AllMethodsProvider.getAllMethods;

import io.mateu.core.domain.FragmentMapper;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ActionPositionDto;
import io.mateu.dtos.ActionStereotypeDto;
import io.mateu.dtos.ActionTargetDto;
import io.mateu.dtos.ActionTypeDto;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.dtos.MenuTypeDto;
import io.mateu.dtos.StatusDto;
import io.mateu.dtos.StatusTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Named
public class ReflectionFragmentMapper implements FragmentMapper {

  @Override
  public List<UIFragmentDto> mapToFragments(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var fragments = new ArrayList<UIFragmentDto>();
    if (instance instanceof Form form) {
      fragments.add(mapFormToFragment(form, baseUrl, initiatorComponentId, httpRequest));
    }
    if (instance instanceof App app) {
      fragments.add(mapAppToFragment(app, baseUrl, route, initiatorComponentId, httpRequest));
    }
    return fragments;
  }

  private UIFragmentDto mapAppToFragment(
      App app, String baseUrl, String route, String initiatorComponentId, HttpRequest httpRequest) {
    var appRoute = getRoute(app, httpRequest, route);
    var menu = getMenu(app, route, appRoute);
    var appDto =
        new AppDto(
            appRoute,
            AppVariantDto.TABS,
            "icon",
            "logo",
            getTitle(app),
            getSubtitle(app),
            menu,
            getHomeRoute(menu),
            "login_url",
            "welcome_message",
            "logout_url",
            List.of());
    var component = new ComponentDto(appDto, "component_id", app.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, app);
  }

  /*
  private String getSelectedRoute(String appRoute, String fullRoute) {
    if (fullRoute.startsWith(appRoute)) {
      return fullRoute.substring(appRoute.length());
    }
    return fullRoute;
  }
   */

  private String getHomeRoute(List<MenuDto> menu) {
    if (menu != null) {
      for (MenuDto option : menu) {
        if (option.selected()) {
          return option.destination().route();
        }
      }
    }
    return "/home";
  }

  protected String getRoute(App app, HttpRequest httpRequest, String route) {
    Pattern pattern = null;
    if (app instanceof RouteResolver routeResolver) {
      pattern = routeResolver.getMatchingPattern(route).orElse(null);
    }
    if (pattern == null) {
      if (app.getClass().isAnnotationPresent(Route.class)) {
        for (Route routeAnnotation : app.getClass().getAnnotationsByType(Route.class)) {
          var annotationPattern = Pattern.compile(routeAnnotation.value());
          if (annotationPattern.matcher(route).matches()) {
            pattern = annotationPattern;
          }
        }
      }
    }
    if (pattern != null) {
      Pattern basePattern =
          Pattern.compile(pattern.pattern().substring(0, pattern.pattern().indexOf(".*")));
      StringBuilder accumulated = new StringBuilder();
      for (String token :
          Arrays.stream(route.split("/")).filter(token -> !"".equals(token)).toList()) {
        if (!basePattern.matcher(accumulated + "/" + token).matches()) {
          break;
        }
        accumulated.append("/").append(token);
      }
      return accumulated.toString();
    }
    return route;
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
            createActions(form),
            List.of(),
            List.of(),
            List.of());
    var component =
        new ComponentDto(
            formDto, "component_id", form.getClass().getName(), createFormContent(form));
    return new UIFragmentDto(initiatorComponentId, component, form);
  }

  private List<ComponentDto> createFormContent(Form form) {
    var formLayout = new FormLayoutDto();
    return List.of(new ComponentDto(formLayout, "", null, createFields(form)));
  }

  private List<ComponentDto> createFields(Form form) {
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

  private List<ActionDto> createActions(Form form) {
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

  private List<MenuDto> getMenu(Object instance, String route, String appRoute) {
    if (instance instanceof HasMenu hasMenu) {
      var menuFromApp = hasMenu.createMenu();
      var selectedRoute =
          appRoute.equals(route)
              ? menuFromApp.stream()
                  .filter(Menu::selected)
                  .findFirst()
                  .map(option -> option.destination().route())
                  .orElse(route)
              : route;
      var menu =
          menuFromApp.stream()
              .map(
                  option ->
                      new MenuDto(
                          MenuTypeDto.MenuOption,
                          "icon",
                          option.label(),
                          new GoToRouteDto("", option.destination().route(), ""),
                          List.of(),
                          0,
                          true,
                          isSelected(option, selectedRoute)))
              .toList();
      return menu;
    }
    return List.of();
  }

  private boolean isSelected(Menu menu, String route) {
    if (route != null && !"".equals(route)) {
      return menu.destination().route().equals(route);
    }
    return menu.selected();
  }
}
