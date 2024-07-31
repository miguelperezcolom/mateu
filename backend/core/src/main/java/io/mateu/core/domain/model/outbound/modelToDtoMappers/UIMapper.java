package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import io.mateu.dtos.Menu;
import io.mateu.dtos.UI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UIMapper {

  final ApplicationContext applicationContext;
  final ReflectionHelper reflectionHelper;
  final MenuBuilder menuCreator;
  final CaptionProvider captionProvider;

  public UI map(Object uiInstance, ServerHttpRequest serverHttpRequest) throws Exception {

    if (uiInstance instanceof DynamicUI) {
      return ((DynamicUI) uiInstance).build().toFuture().get();
    }

    UI ui = UI.builder().build();

    ui.setTitle(getTitle(uiInstance));
    ui.setSubtitle(getSubtitle(uiInstance));
    ui.setHomeJourneyTypeId("____home____");
    List<Menu> menuOptions = menuCreator.buildMenuForUi(uiInstance, serverHttpRequest);
    ui.setMenu(menuOptions);
    if (uiInstance instanceof HasLogin) {
      ui.setLoginUrl(((HasLogin) uiInstance).getLoginUrl());
    }
    if (uiInstance instanceof HasLogout) {
      ui.setLogoutUrl(((HasLogout) uiInstance).getLogoutUrl());
    }

    return ui;
  }

  public boolean isForm(Object uiInstance) {
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
    return captionProvider.getCaption(uiInstance);
  }
}
