package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.dynamic.DynamicUI;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.UIDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class UIMapper {

  final ApplicationContext applicationContext;
  final ReflectionService reflectionService;
  final MenuBuilder menuCreator;
  final CaptionProvider captionProvider;

  public UIDto map(Object uiInstance, String baseUrl, ServerHttpRequest serverHttpRequest)
      throws Exception {

    if (uiInstance instanceof DynamicUI) {
      return ((DynamicUI) uiInstance).build().toFuture().get();
    }

    UIDto ui =
        new UIDto(
            getFavIcon(uiInstance),
            getIcon(uiInstance),
            getLogo(uiInstance),
            getTitle(uiInstance),
            getSubtitle(uiInstance),
            menuCreator.buildMenuForUi(uiInstance, baseUrl, serverHttpRequest),
            "____home____",
            getLoginUrl(uiInstance),
            getLogoutUrl(uiInstance),
            getApps(uiInstance));

    return ui;
  }

  private String getLogo(Object uiInstance) {
    if (uiInstance instanceof HasLogo hasLogo) {
      return hasLogo.getLogoUrl();
    }
    return null;
  }

  private String getFavIcon(Object uiInstance) {
    if (uiInstance instanceof HasFavicon hasFavicon) {
      return hasFavicon.getFavicon();
    }
    if (uiInstance.getClass().isAnnotationPresent(FavIcon.class)) {
      return uiInstance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  private String getIcon(Object uiInstance) {
    if (uiInstance instanceof HasIcon hasIcon) {
      return hasIcon.getIcon();
    }
    if (uiInstance.getClass().isAnnotationPresent(AppIcon.class)) {
      return uiInstance.getClass().getAnnotation(AppIcon.class).value().iconName;
    }
    return null;
  }

  private List<AppDto> getApps(Object uiInstance) {
    if (uiInstance instanceof HasApps hasApps) {
      return hasApps.getApps().stream()
          .map(
              app ->
                  new AppDto(app.icon(), app.name(), app.description(), app.url(), app.disabled()))
          .toList();
    }
    return List.of();
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
    for (Field field : reflectionService.getAllFields(uiInstance.getClass())) {
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
    if (uiInstance.getClass().isAnnotationPresent(AppTitle.class)) {
      return uiInstance.getClass().getAnnotation(AppTitle.class).value();
    }
    if (uiInstance instanceof HasTitle) {
      return ((HasTitle) uiInstance).getTitle();
    }
    if (uiInstance.getClass().isAnnotationPresent(Title.class)) {
      return uiInstance.getClass().getAnnotation(Title.class).value();
    }
    return captionProvider.getCaption(uiInstance);
  }
}
