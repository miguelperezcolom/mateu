package io.mateu.core.domain.model.outbound.metadataBuilders;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.usecases.AllEditableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.ManagedTypeChecker;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.interfaces.Crud;
import io.mateu.uidl.interfaces.HasActions;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
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

  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;
  private final AllEditableFieldsProvider allEditableFieldsProvider;
  private final ManagedTypeChecker managedTypeChecker;

  protected Action getAction(String prefix, Method m) {
    Action action =
        new Action(
            prefix + m.getName(),
            getIcon(m),
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
            isRunOnEnter(m),
            getPosition(m),
            getTimeoutMillis(m),
            getOrder(m));
    return action;
  }

  private int getOrder(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.order();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.order();
    }
    if (m.isAnnotationPresent(Button.class)) {
      Button action = m.getAnnotation(Button.class);
      return action.order();
    }
    return Integer.MAX_VALUE;
  }

  private String getIcon(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.icon().iconName;
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.icon().iconName;
    }
    return null;
  }

  private ActionPosition getPosition(Method m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionPosition.valueOf(action.position().name());
    }
    return ActionPosition.Right;
  }

  private boolean isRunOnEnter(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.runOnEnter();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.runOnEnter();
    }
    return true;
  }

  private int getTimeoutMillis(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.timeoutMillis();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.timeoutMillis();
    }
    return 0;
  }

  private String getModalStyle(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.modalStyle();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.modalStyle();
    }
    return "";
  }

  private String getModalTitle(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.modalTitle();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return action.modalTitle();
    }
    return "";
  }

  private ActionTarget getTarget(Method m) {
    return ActionTarget.valueOf(getRealTarget(m).name());
  }

  private io.mateu.uidl.annotations.ActionTarget getRealTarget(Method m) {
    var target = io.mateu.uidl.annotations.ActionTarget.View;
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      target = m.getAnnotation(io.mateu.uidl.annotations.Action.class).target();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      target = m.getAnnotation(MainAction.class).target();
    }
    if (URL.class.equals(m.getReturnType())) {
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

  private boolean isVisible(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return action.visible();
    }
    return true;
  }

  private ActionThemeVariant[] getActionThemeVariants(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return getActionThemeVariants(action.variants());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return getActionThemeVariants(action.variants());
    }
    return new ActionThemeVariant[0];
  }

  private ActionThemeVariant[] getActionThemeVariants(
      io.mateu.uidl.annotations.ActionThemeVariant[] variants) {
    if (variants == null || variants.length == 0) {
      return new ActionThemeVariant[0];
    }
    return Arrays.stream(variants)
        .map(v -> ActionThemeVariant.valueOf(v.name()))
        .toArray(ActionThemeVariant[]::new);
  }

  private ActionType getActionType(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return ActionType.valueOf(action.type().name());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionType.valueOf(action.type().name());
    }
    return ActionType.Primary;
  }

  private ConfirmationTexts getConfirmationTexts(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
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
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return !Strings.isNullOrEmpty(
          m.getAnnotation(io.mateu.uidl.annotations.Action.class).confirmationMessage());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return !Strings.isNullOrEmpty(m.getAnnotation(MainAction.class).confirmationMessage());
    }
    return false;
  }

  private boolean getRowsSelectedRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).rowsSelectedRequired();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).rowsSelectedRequired();
    }
    return true;
  }

  private boolean getValidationRequired(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).validateBefore();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).validateBefore();
    }
    return true;
  }

  private String getCustomEvent(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).customEvent();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).customEvent();
    }
    return "";
  }

  private String getHref(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).href();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).href();
    }
    return "";
  }

  protected List<Action> getActions(String listId, Object uiInstance) {
    List<Action> actions = getActions(uiInstance);
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
                          a.variants(),
                          a.visible(),
                          a.validationRequired(),
                          a.confirmationRequired(),
                          a.rowsSelectedRequired(),
                          a.confirmationTexts(),
                          a.target(),
                          a.modalStyle(),
                          a.modalTitle(),
                          a.customEvent(),
                          a.href(),
                          false,
                          ActionPosition.Right,
                          a.timeoutMillis(),
                          a.order()))
              .toList();
    if (canAdd(uiInstance)) {
      Action action =
          new Action(
              "__list__" + listId + "__new",
              null,
              getCaptionForNew(uiInstance),
              ActionType.Primary,
              new ActionThemeVariant[0],
              true,
              false,
              false,
              false,
              null,
              ActionTarget.View,
              null,
              null,
              null,
              null,
              false,
              ActionPosition.Right,
              0,
              Integer.MAX_VALUE);
      actions = Stream.concat(actions.stream(), Stream.of(action)).toList();
    }
    if (canDelete(uiInstance)) {
      Action action =
          new Action(
              "__list__" + listId + "__delete",
              null,
              getCaptionForDelete(uiInstance),
              ActionType.Primary,
              new ActionThemeVariant[0],
              true,
              false,
              true,
              true,
              new ConfirmationTexts(
                  "Please confirm",
                  "Are you sure you want to delete the selected rows",
                  "Yes, delete them"),
              ActionTarget.View,
              null,
              null,
              null,
              null,
              false,
              ActionPosition.Right,
              0,
              Integer.MAX_VALUE);
      actions = Stream.concat(actions.stream(), Stream.of(action)).toList();
    }
    return actions;
  }

  public List<Action> getActions(Object uiInstance) {
    return getActionsWithPrefix("", uiInstance);
  }

  private List<Action> getActionsWithPrefix(String prefix, Object uiInstance) {
    if (uiInstance == null) {
      return new ArrayList<>();
    }
    Class type;
    if (Class.class.equals(uiInstance)) {
      type = (Class) uiInstance;
    } else {
      type = uiInstance.getClass();
    }
    List<Method> allMethods = reflectionService.getAllMethods(type);
    List<Action> actions =
        allMethods.stream()
            .filter(m -> m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
            .filter(
                m ->
                    (!"JpaRpcCrudView".equals(type.getSimpleName()))
                        || (Modifier.isStatic(m.getModifiers())))
            .map(m -> getAction(prefix, m))
            .collect(Collectors.toList());
    if (uiInstance instanceof HasActions) {
      actions.addAll(
          ((HasActions) uiInstance)
              .getActionMethods().stream()
                  .map(m -> getAction(prefix, m))
                  .collect(Collectors.toList()));
    }
    allEditableFieldsProvider.getAllEditableFields(type).stream()
        .filter(f -> !managedTypeChecker.isManaged(f))
        .forEach(
            f -> {
              try {
                var value = reflectionService.getValue(f, uiInstance);
                if (value == null) {
                  value = reflectionService.newInstance(f.getType());
                }
                actions.addAll(getActionsWithPrefix(f.getName() + ".", value));
              } catch (NoSuchMethodException
                  | IllegalAccessException
                  | InvocationTargetException
                  | InstantiationException e) {
                throw new RuntimeException(e);
              }
            });
    actions.sort(Comparator.comparing(Action::caption));
    actions.sort(Comparator.comparing(Action::order));
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

  private boolean canAdd(Object uiInstance) {
    if (uiInstance instanceof RpcCrudViewExtended) {
      return ((RpcCrudViewExtended) uiInstance).isAddEnabled();
    }
    if (uiInstance instanceof Crud) {
      return reflectionService.isOverridden(uiInstance, "getNewRecordForm");
    }
    return false;
  }

  private boolean canDelete(Object uiInstance) {
    if (uiInstance instanceof RpcCrudViewExtended) {
      return ((RpcCrudViewExtended) uiInstance).isDeleteEnabled();
    }
    if (uiInstance instanceof Crud) {
      return reflectionService.isOverridden(uiInstance, "delete");
    }
    return false;
  }
}
