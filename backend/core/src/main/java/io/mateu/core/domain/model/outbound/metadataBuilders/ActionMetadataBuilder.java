package io.mateu.core.domain.model.outbound.metadataBuilders;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.Action;
import io.mateu.dtos.ActionTarget;
import io.mateu.dtos.ActionType;
import io.mateu.dtos.ConfirmationTexts;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ActionMetadataBuilder {

  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;

  protected Action getAction(Method m) {
    Action action =
        new Action(
            m.getName(),
            null,
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
            getHref(m),
                isRunOnEnter(m));
    return action;
  }

  private boolean isRunOnEnter(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      io.mateu.core.domain.uidefinition.shared.annotations.Action action =
              m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class);
      return action.runOnEnter();
    }
    return true;
  }

  private String getModalStyle(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      io.mateu.core.domain.uidefinition.shared.annotations.Action action =
          m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class);
      return action.modalStyle();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.modalStyle();
    }
    return "";
  }

  private ActionTarget getTarget(Method m) {
    return ActionTarget.valueOf(getRealTarget(m).name());
  }

  private io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget getRealTarget(
      Method m) {
    var target = io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget.View;
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      target =
          m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
              .target();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      target = m.getAnnotation(MainAction.class).target();
    }
    if (URL.class.equals(m.getReturnType())) {
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

  private boolean isVisible(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      io.mateu.core.domain.uidefinition.shared.annotations.Action action =
          m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class);
      return action.visible();
    }
    return true;
  }

  private ActionType getActionType(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      io.mateu.core.domain.uidefinition.shared.annotations.Action action =
          m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class);
      return ActionType.valueOf(action.type().name());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionType.valueOf(action.type().name());
    }
    return ActionType.Primary;
  }

  private ConfirmationTexts getConfirmationTexts(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      io.mateu.core.domain.uidefinition.shared.annotations.Action action =
          m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class);
      return new ConfirmationTexts(
          getConfirmationTitle(action.confirmationTitle(), m),
          action.confirmationMessage(),
          getConfirmationAction(action.confirmationAction(), m));
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return new ConfirmationTexts(
          getConfirmationTitle(action.confirmationTitle(), m),
          action.confirmationMessage(),
          getConfirmationAction(action.confirmationAction(), m));
    }
    return null;
  }

  private String getConfirmationAction(String action, Method m) {
    if (Strings.isNullOrEmpty(action)) {
      return captionProvider.getCaption(m);
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
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      return !Strings.isNullOrEmpty(
          m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
              .confirmationMessage());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return !Strings.isNullOrEmpty(m.getAnnotation(MainAction.class).confirmationMessage());
    }
    return false;
  }

  private boolean getRowsSelectedRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
          .rowsSelectedRequired();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).rowsSelectedRequired();
    }
    return true;
  }

  private boolean getValidationRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
          .validateBefore();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).validateBefore();
    }
    return true;
  }

  private String getCustomEvent(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
          .customEvent();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).customEvent();
    }
    return "";
  }

  private String getHref(Method m) {
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
          .href();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).href();
    }
    return "";
  }

  protected List<Action> getActions(String listId, Object uiInstance) {
    List<Method> allMethods = reflectionHelper.getAllMethods(uiInstance.getClass());
    List<Action> actions =
        allMethods.stream()
            .filter(
                m ->
                    m.isAnnotationPresent(
                        io.mateu.core.domain.uidefinition.shared.annotations.Action.class))
            .filter(
                m ->
                    (!"JpaRpcCrudView".equals(uiInstance.getClass().getSimpleName()))
                        || (Modifier.isStatic(m.getModifiers())))
            .sorted(
                Comparator.comparingInt(
                    m ->
                        m.getAnnotation(
                                io.mateu.core.domain.uidefinition.shared.annotations.Action.class)
                            .order()))
            .map(m -> getAction(m))
            .collect(Collectors.toList());
    if (uiInstance instanceof HasActions) {
      actions.addAll(
          ((HasActions) uiInstance)
              .getActionMethods().stream().map(m -> getAction(m)).collect(Collectors.toList()));
    }
    if (!Strings.isNullOrEmpty(listId))
      actions =
          actions.stream()
              .map(
                  a ->
                      new Action(
                          "__list__" + listId + "__" + a.id(),
                          null,
                          a.caption(),
                          a.type(),
                          a.visible(),
                          a.validationRequired(),
                          a.confirmationRequired(),
                          a.rowsSelectedRequired(),
                          a.confirmationTexts(),
                          a.target(),
                          a.modalStyle(),
                          a.customEvent(),
                          a.href(),
                              false))
              .toList();
    if (canAdd(uiInstance)) {
      Action action =
          new Action(
              "__list__" + listId + "__new",
              null,
              getCaptionForNew(uiInstance),
              ActionType.Primary,
              true,
              false,
              false,
              false,
              null,
              ActionTarget.View,
              null,
              null,
              null,
                  false);
      actions = Stream.concat(actions.stream(), Stream.of(action)).toList();
    }
    if (canDelete(uiInstance)) {
      Action action =
          new Action(
              "__list__" + listId + "__delete",
              null,
              getCaptionForDelete(uiInstance),
              ActionType.Primary,
              true,
              false,
              true,
              false,
              new ConfirmationTexts(
                  "Please confirm",
                  "Are you sure you want to delete the selected rows",
                  "Yes, delete them"),
              ActionTarget.View,
              null,
              null,
              null,
                  false);
      actions = Stream.concat(actions.stream(), Stream.of(action)).toList();
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
