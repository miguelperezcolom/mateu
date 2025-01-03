package io.mateu.core.domain.model.outbound.metadataBuilders;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.Button;
import java.net.URL;
import java.util.Arrays;
import java.util.concurrent.Callable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ButtonMetadataBuilder {

  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;

  public ActionDto getAction(Field m) {
    ActionDto action =
        new ActionDto(
            m.getName(),
            null,
            captionProvider.getCaption(m),
            getActionType(m),
            getActionThemeVariants(m),
            isVisible(m),
            getValidationRequired(m),
            getConfirmationRequired(m),
            getRowsSelectedRequired(m),
            getConfirmationTexts(m),
            getTarget(m),
            getModalStyle(m),
            getModalTitle(m),
            getCustomEvent(m),
            getHref(m),
            getRunEonEnter(m),
            ActionPositionDto.Right,
            0,
            getOrder(m));
    return action;
  }

  private int getOrder(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).order();
    }
    return Integer.MAX_VALUE;
  }

  private boolean getRunEonEnter(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).runOnEnter();
    }
    return false;
  }

  private String getModalStyle(Field f) {
    if (f.isAnnotationPresent(Button.class)) {
      return f.getAnnotation(Button.class).modalStyle();
    }
    return "";
  }

  private String getModalTitle(Field f) {
    if (f.isAnnotationPresent(Button.class)) {
      return f.getAnnotation(Button.class).modalTitle();
    }
    return "";
  }

  private ActionTargetDto getTarget(Field m) {
    return ActionTargetDto.valueOf(getRealTarget(m).name());
  }

  private io.mateu.uidl.annotations.ActionTarget getRealTarget(Field m) {
    var target = io.mateu.uidl.annotations.ActionTarget.View;
    if (m.isAnnotationPresent(Button.class)) {
      target = m.getAnnotation(Button.class).target();
    }
    if (Callable.class.isAssignableFrom(m.getType())
        && URL.class.equals(reflectionService.getGenericClass(m, Callable.class, "V"))) {
      if (io.mateu.uidl.annotations.ActionTarget.NewTab.equals(target)) {
        target = io.mateu.uidl.annotations.ActionTarget.DeferredNewTab;
      } else if (io.mateu.uidl.annotations.ActionTarget.NewWindow.equals(target)) {
        target = io.mateu.uidl.annotations.ActionTarget.DeferredNewWindow;
      } else {
        target = io.mateu.uidl.annotations.ActionTarget.Deferred;
      }
    }
    return target;
  }

  private boolean isVisible(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).visible();
    }
    return true;
  }

  private ActionTypeDto getActionType(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return ActionTypeDto.valueOf(m.getAnnotation(Button.class).type().name());
    }
    return ActionTypeDto.Primary;
  }

  private ActionThemeVariantDto[] getActionThemeVariants(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return getActionThemeVariants(m.getAnnotation(Button.class).variants());
    }
    return new ActionThemeVariantDto[0];
  }

  private ActionThemeVariantDto[] getActionThemeVariants(
      io.mateu.uidl.annotations.ActionThemeVariant[] variants) {
    if (variants == null || variants.length == 0) {
      return new ActionThemeVariantDto[0];
    }
    return Arrays.stream(variants)
        .map(v -> ActionThemeVariantDto.valueOf(v.name()))
        .toArray(ActionThemeVariantDto[]::new);
  }

  private ConfirmationTextsDto getConfirmationTexts(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      var button = m.getAnnotation(Button.class);
      return new ConfirmationTextsDto(
          getConfirmationTitle(button.confirmationTitle(), m),
          button.confirmationMessage(),
          getConfirmationAction(button.confirmationAction(), m));
    }
    return null;
  }

  private String getConfirmationAction(String action, Field m) {
    if (Strings.isNullOrEmpty(action)) {
      return captionProvider.getCaption(m);
    }
    return action;
  }

  private String getConfirmationTitle(String title, Field m) {
    if (Strings.isNullOrEmpty(title)) {
      return "Please confirm";
    }
    return title;
  }

  private boolean getConfirmationRequired(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return !Strings.isNullOrEmpty(m.getAnnotation(Button.class).confirmationMessage());
    }
    return false;
  }

  private boolean getRowsSelectedRequired(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).rowsSelectedRequired();
    }
    return true;
  }

  private boolean getValidationRequired(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).validateBefore();
    }
    return true;
  }

  private String getCustomEvent(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).customEvent();
    }
    return "";
  }

  private String getHref(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).href();
    }
    return "";
  }
}
