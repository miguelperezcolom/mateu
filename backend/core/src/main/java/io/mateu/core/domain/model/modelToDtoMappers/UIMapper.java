package io.mateu.core.domain.model.modelToDtoMappers;

import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.app.AbstractAction;
import io.mateu.core.domain.uidefinition.core.app.AbstractMenu;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.core.domain.util.Helper;
import io.mateu.dtos.Menu;
import io.mateu.dtos.MenuType;
import io.mateu.dtos.UI;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UIMapper {

  final ApplicationContext applicationContext;
  final ReflectionHelper reflectionHelper;
  final MenuParser menuParser;

  public UI map(Object uiInstance, ServerHttpRequest serverHttpRequest) throws Exception {

    if (uiInstance instanceof DynamicUI) {
      return ((DynamicUI) uiInstance).build().toFuture().get();
    }

    UI ui = UI.builder().build();

    ui.setTitle(getTitle(uiInstance));
    ui.setSubtitle(getSubtitle(uiInstance));
    ui.setHomeJourneyTypeId(uiInstance.getClass().getName());
    List<Menu> menuOptions = getMenu(uiInstance, serverHttpRequest);
    ui.setMenu(menuOptions);
    if (uiInstance instanceof HasLogin) {
      ui.setLoginUrl(((HasLogin) uiInstance).getLoginUrl());
    }
    if (uiInstance instanceof HasLogout) {
      ui.setLogoutUrl(((HasLogout) uiInstance).getLogoutUrl());
    }

    return ui;
  }

  private List<Menu> getMenu(Object uiInstance, ServerHttpRequest serverHttpRequest) {
    List<Menu> menu =
        menuParser.parse(uiInstance, serverHttpRequest).stream()
            .map(e -> createMenu("", e))
            .collect(Collectors.toList());
    return menu;
  }

  private boolean isForm(Object uiInstance) {
    for (FieldInterfaced field : reflectionHelper.getAllFields(uiInstance.getClass())) {
      if (field.isAnnotationPresent(MenuOption.class) || field.isAnnotationPresent(Submenu.class)) {
        return false;
      }
    }
    return true;
  }

  private String getSubtitle(Object uiInstance) {
    if (uiInstance instanceof HasSubtitle) {
      return ((HasSubtitle) uiInstance).getSubtitle();
    }
    return "";
  }

  private String getTitle(Object uiInstance) {
    if (uiInstance instanceof HasAppTitle) {
      return ((HasAppTitle) uiInstance).getAppTitle();
    }
    if (uiInstance instanceof HasTitle) {
      return ((HasTitle) uiInstance).getTitle();
    }
    return reflectionHelper.getCaption(uiInstance);
  }

  private Menu createMenu(String prefix, MenuEntry menuEntry) {
    String journeyTypeId = prefix + Helper.camelcasize(menuEntry.getCaption());
    if (menuEntry instanceof AbstractMenu) {
      return Menu.builder()
          .type(MenuType.Submenu)
          .icon(menuEntry.getIcon())
          .caption(menuEntry.getCaption())
          .submenus(createSubmenus(journeyTypeId + "_", (AbstractMenu) menuEntry))
          .build();
    }
    if (menuEntry instanceof AbstractAction) {
      applicationContext
          .getBean(JourneyStoreService.class)
          .storeMenuAction(journeyTypeId, menuEntry);
    }
    return Menu.builder()
        .type(MenuType.MenuOption)
        .icon(menuEntry.getIcon())
        .journeyTypeId(journeyTypeId)
        .caption(menuEntry.getCaption())
        .build();
  }

  private List<Menu> createSubmenus(String prefix, AbstractMenu m) {
    return m.getEntries().stream().map(e -> createMenu(prefix, e)).collect(Collectors.toList());
  }
}
