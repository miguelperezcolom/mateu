package io.mateu.core.domain.modelToDtoMappers;

import io.mateu.core.application.MateuRemoteClient;
import io.mateu.core.domain.store.JourneyStoreService;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.MenuType;
import io.mateu.remote.dtos.UI;
import io.mateu.util.Helper;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class UIMapper {

  @Autowired ApplicationContext applicationContext;

  @Autowired MateuRemoteClient mateuRemoteClient;

  public UI map(Object uiInstance, ServerHttpRequest serverHttpRequest) throws Exception {
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
        new MenuParser(mateuRemoteClient, uiInstance, serverHttpRequest)
            .parse().stream().map(e -> createMenu("", e)).collect(Collectors.toList());
    return menu;
  }

  private boolean isForm(Object uiInstance) {
    for (FieldInterfaced field : ReflectionHelper.getAllFields(uiInstance.getClass())) {
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
    return ReflectionHelper.getCaption(uiInstance);
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
