package io.mateu.core.domain.model.metadataBuilders;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Action;
import io.mateu.remote.dtos.ActionTarget;
import io.mateu.remote.dtos.ActionType;
import jakarta.persistence.Entity;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActionMetadataBuilder {

  final ReflectionHelper reflectionHelper;

  protected Action getAction(Method m) {
    Action action =
        Action.builder()
            .id(m.getName())
            .caption(reflectionHelper.getCaption(m))
            .type(getActionType(m))
            .target(getTarget(m))
            .modalStyle(getModalStyle(m))
            .visible(isVisible(m))
            .validationRequired(getValidationRequired(m))
            .confirmationRequired(getConfirmationRequired(m))
            .rowsSelectedRequired(getRowsSelectedRequired(m))
            .customEvent(getCustomEvent(m))
            .href(getHref(m))
            .confirmationTexts(getConfirmationTexts(m))
            .build();
    return action;
  }

  private String getModalStyle(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      io.mateu.mdd.shared.annotations.Action action =
          m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class);
      return action.modalStyle();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.modalStyle();
    }
    return "";
  }

  private ActionTarget getTarget(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      io.mateu.mdd.shared.annotations.Action action =
          m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class);
      return ActionTarget.valueOf(action.target().name());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionTarget.valueOf(action.target().name());
    }
    return ActionTarget.SameLane;
  }

  private boolean isVisible(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      io.mateu.mdd.shared.annotations.Action action =
          m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class);
      return action.visible();
    }
    return true;
  }

  private ActionType getActionType(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      io.mateu.mdd.shared.annotations.Action action =
          m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class);
      return ActionType.valueOf(action.type().name());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionType.valueOf(action.type().name());
    }
    return ActionType.Primary;
  }

  private ConfirmationTexts getConfirmationTexts(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      io.mateu.mdd.shared.annotations.Action action =
          m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class);
      return ConfirmationTexts.builder()
          .title(getConfirmationTitle(action.confirmationTitle(), m))
          .message(action.confirmationMessage())
          .action(getConfirmationAction(action.confirmationAction(), m))
          .build();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ConfirmationTexts.builder()
          .title(getConfirmationTitle(action.confirmationTitle(), m))
          .message(action.confirmationMessage())
          .action(getConfirmationAction(action.confirmationAction(), m))
          .build();
    }
    return null;
  }

  private String getConfirmationAction(String action, Method m) {
    if (Strings.isNullOrEmpty(action)) {
      return reflectionHelper.getCaption(m);
    }
    return action;
  }

  private String getConfirmationTitle(String title, Method m) {
    if (Strings.isNullOrEmpty(title)) {
      return "Please confirm";
    }
    return title;
  }

  private boolean getConfirmationRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      return !Strings.isNullOrEmpty(
          m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).confirmationMessage());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return !Strings.isNullOrEmpty(m.getAnnotation(MainAction.class).confirmationMessage());
    }
    return false;
  }

  private boolean getRowsSelectedRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).rowsSelectedRequired();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).rowsSelectedRequired();
    }
    return true;
  }

  private boolean getValidationRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).validateBefore();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).validateBefore();
    }
    return true;
  }

  private String getCustomEvent(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).customEvent();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).customEvent();
    }
    return "";
  }

  private String getHref(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).href();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).href();
    }
    return "";
  }

  protected List<Action> getActions(String stepId, String listId, Object uiInstance) {
    List<Method> allMethods = reflectionHelper.getAllMethods(uiInstance.getClass());
    List<Action> actions =
        allMethods.stream()
            .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
            .filter(
                m ->
                    (!"JpaRpcCrudView".equals(uiInstance.getClass().getSimpleName()))
                        || (Modifier.isStatic(m.getModifiers())))
            .sorted(
                Comparator.comparingInt(
                    m -> m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).order()))
            .map(m -> getAction(m))
            .collect(Collectors.toList());
    if (uiInstance instanceof HasActions) {
      actions.addAll(
          ((HasActions) uiInstance)
              .getActionMethods().stream().map(m -> getAction(m)).collect(Collectors.toList()));
    }
    if (!Strings.isNullOrEmpty(listId))
      actions.forEach(a -> a.setId("__list__" + listId + "__" + a.getId()));
    if (canAdd(uiInstance)) {
      Action action =
          Action.builder()
              .id("__list__" + listId + "__new")
              .caption(getCaptionForNew(uiInstance))
              .type(ActionType.Primary)
              .visible(true)
              .build();
      actions.add(action);
    }
    if (canDelete(uiInstance)) {
      Action action =
          Action.builder()
              .id("__list__" + listId + "__delete")
              .caption(getCaptionForDelete(uiInstance))
              .type(ActionType.Primary)
              .confirmationRequired(true)
              .confirmationTexts(
                  ConfirmationTexts.builder()
                      .title("Please confirm")
                      .message("Are you sure you want to delete the selected rows")
                      .action("Yes, delete them")
                      .build())
              .visible(true)
              .build();
      actions.add(action);
    }
    if (("view".equals(stepId) && uiInstance.getClass().isAnnotationPresent(Entity.class))
        || ((uiInstance instanceof ReadOnlyPojo && ((ReadOnlyPojo<?>) uiInstance).hasEditor()) && !(uiInstance instanceof PersistentPojo))) {
      Action action =
          Action.builder()
              .id("edit")
              .caption(getCaptionForEdit(uiInstance))
              .type(ActionType.Primary)
              .visible(true)
              .build();
      actions.add(action);
    }
    return actions;
  }

  private String getCaptionForNew(Object uiInstance) {
    if (uiInstance != null && uiInstance instanceof Crud) {
      return ((Crud) uiInstance).getCaptionForNew();
    }
    return "New";
  }

  private String getCaptionForDelete(Object uiInstance) {
    if (uiInstance != null && uiInstance instanceof Crud) {
      return ((Crud) uiInstance).getCaptionForDelete();
    }
    return "Delete";
  }

  private String getCaptionForEdit(Object uiInstance) {
    if (uiInstance != null && uiInstance instanceof Listing) {
      return ((Listing) uiInstance).getCaptionForEdit();
    }
    return "Edit";
  }

  private boolean canAdd(Object uiInstance) {
    if (uiInstance instanceof RpcCrudViewExtended) {
      return ((RpcCrudViewExtended) uiInstance).isAddEnabled();
    }
    if (uiInstance instanceof Crud) {
      return reflectionHelper.isOverridden(uiInstance, "getNewRecordForm");
    }
    return false;
  }

  private boolean canDelete(Object uiInstance) {
    if (uiInstance instanceof RpcCrudViewExtended) {
      return ((RpcCrudViewExtended) uiInstance).isDeleteEnabled();
    }
    if (uiInstance instanceof Crud) {
      return reflectionHelper.isOverridden(uiInstance, "delete");
    }
    return false;
  }
}
