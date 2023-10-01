package io.mateu.core.domain.metadataBuilders;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Action;
import io.mateu.remote.dtos.ActionType;
import jakarta.persistence.Entity;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ActionMetadataBuilder {

  protected Action getAction(Method m) {
    Action action =
        Action.builder()
            .id(m.getName())
            .caption(ReflectionHelper.getCaption(m))
            .type(getActionType(m))
            .visible(isVisible(m))
            .validationRequired(getValidationRequired(m))
            .confirmationRequired(getConfirmationRequired(m))
            .confirmationTexts(getConfirmationTexts(m))
            .build();
    return action;
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
      return ReflectionHelper.getCaption(m);
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

  private boolean getValidationRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.mdd.shared.annotations.Action.class).validateBefore();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).validateBefore();
    }
    return true;
  }

  protected List<Action> getActions(String stepId, String listId, Object uiInstance) {
    List<Method> allMethods = ReflectionHelper.getAllMethods(uiInstance.getClass());
    List<Action> actions =
        allMethods.stream()
            .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
            .filter(
                m ->
                    (!"JpaRpcCrudView".equals(uiInstance.getClass().getSimpleName()))
                        || (Modifier.isStatic(m.getModifiers())))
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
        || (uiInstance instanceof ReadOnlyPojo && !(uiInstance instanceof PersistentPojo))) {
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
    if (uiInstance instanceof Crud) {
      return ReflectionHelper.isOverridden(uiInstance, "getNewRecordForm");
    }
    if (uiInstance instanceof RpcCrudViewExtended) {
      return ((RpcCrudViewExtended) uiInstance).isAddEnabled();
    }
    return false;
  }

  private boolean canDelete(Object uiInstance) {
    if (uiInstance instanceof Crud) {
      return ReflectionHelper.isOverridden(uiInstance, "delete");
    }
    if (uiInstance instanceof RpcCrudViewExtended) {
      return ((RpcCrudViewExtended) uiInstance).isDeleteEnabled();
    }
    return false;
  }
}
