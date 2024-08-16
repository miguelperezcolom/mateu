package io.mateu.core.domain.model.outbound.metadataBuilders;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Button;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.Action;
import io.mateu.dtos.ActionTarget;
import io.mateu.dtos.ActionType;
import io.mateu.dtos.ConfirmationTexts;
import jakarta.persistence.Entity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ButtonMetadataBuilder {

  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;

  public Action getAction(Field m) {
    Action action =
        new Action(
            m.getName(),
            captionProvider.getCaption(m),
            getActionType(m),
            isVisible(m),
            getValidationRequired(m),
            getConfirmationRequired(m),
            getRowsSelectedRequired(m),
            getConfirmationTexts(m),
            getTarget(m),
            getModalStyle(m),
            getCustomEvent(m),
            getHref(m));
    return action;
  }

  private String getModalStyle(Field f) {
    if (f.isAnnotationPresent(Button.class)) {
      return f.getAnnotation(Button.class).modalStyle();
    }
    return "";
  }

  private ActionTarget getTarget(Field m) {
    return ActionTarget.valueOf(getRealTarget(m).name());
  }

  private io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget getRealTarget(
          Field m) {
    var target = io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.SameLane;
    if (m.isAnnotationPresent(Button.class)) {
      target =
          m.getAnnotation(Button.class)
              .target();
    }
    if (Callable.class.isAssignableFrom(m.getType()) && URL.class.equals(reflectionHelper.getGenericClass(m, Callable.class, "V"))) {
      if (io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.NewTab.equals(target)) {
        target = io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.DeferredNewTab;
      } else if (io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.NewWindow.equals(
          target)) {
        target =
            io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.DeferredNewWindow;
      } else {
        target = io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.Deferred;
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

  private ActionType getActionType(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return ActionType.valueOf(m.getAnnotation(Button.class).type().name());
    }
    return ActionType.Primary;
  }

  private ConfirmationTexts getConfirmationTexts(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      var button = m.getAnnotation(Button.class);
      return new ConfirmationTexts(
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
      return !Strings.isNullOrEmpty(
          m.getAnnotation(Button.class)
              .confirmationMessage());
    }
    return false;
  }

  private boolean getRowsSelectedRequired(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class)
          .rowsSelectedRequired();
    }
    return true;
  }

  private boolean getValidationRequired(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class)
          .validateBefore();
    }
    return true;
  }

  private String getCustomEvent(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class)
          .customEvent();
    }
    return "";
  }

  private String getHref(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class)
          .href();
    }
    return "";
  }

}
