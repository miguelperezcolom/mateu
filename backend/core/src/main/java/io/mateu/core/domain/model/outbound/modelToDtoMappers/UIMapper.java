package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import io.mateu.dtos.UI;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class UIMapper {

  final ApplicationContext applicationContext;
  final ReflectionHelper reflectionHelper;
  final MenuBuilder menuCreator;
  final CaptionProvider captionProvider;

  public UI map(Object uiInstance, ServerHttpRequest serverHttpRequest) throws Exception {

    if (uiInstance instanceof DynamicUI) {
      return ((DynamicUI) uiInstance).build().toFuture().get();
    }

    UI ui =
        new UI(
            null,
            null,
            getTitle(uiInstance),
            getSubtitle(uiInstance),
            menuCreator.buildMenuForUi(uiInstance, serverHttpRequest),
            "____home____",
            getLoginUrl(uiInstance),
            getLogoutUrl(uiInstance));

    return ui;
  }

  private String getLogoutUrl(Object uiInstance) {
    if (uiInstance instanceof HasLogout hasLogout) {
      return hasLogout.getLogoutUrl();
    }
    return null;
  }

  private String getLoginUrl(Object uiInstance) {
    if (uiInstance instanceof HasLogin hasLogin) {
      return hasLogin.getLoginUrl();
    }
    return null;
  }

  public boolean isForm(Object uiInstance) {
    for (Field field : reflectionHelper.getAllFields(uiInstance.getClass())) {
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
