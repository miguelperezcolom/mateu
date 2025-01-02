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

  protected ActionDto getAction(String prefix, Method m) {
    ActionDto action =
        new ActionDto(
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

  private ActionPositionDto getPosition(Method m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionPositionDto.valueOf(action.position().name());
    }
    return ActionPositionDto.Right;
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

  private ActionTargetDto getTarget(Method m) {
    return ActionTargetDto.valueOf(getRealTarget(m).name());
  }

  // todo: remove as target is not handled by frontend
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

  private ActionThemeVariantDto[] getActionThemeVariants(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return getActionThemeVariants(action.variants());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return getActionThemeVariants(action.variants());
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

  private ActionTypeDto getActionType(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return ActionTypeDto.valueOf(action.type().name());
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return ActionTypeDto.valueOf(action.type().name());
    }
    return ActionTypeDto.Primary;
  }

  private ConfirmationTextsDto getConfirmationTexts(Method m) {
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      io.mateu.uidl.annotations.Action action =
          m.getAnnotation(io.mateu.uidl.annotations.Action.class);
      return new ConfirmationTextsDto(
          getConfirmationTitle(action.confirmationTitle(), m),
          action.confirmationMessage(),
          getConfirmationAction(action.confirmationAction(), m));
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      MainAction action = m.getAnnotation(MainAction.class);
      return new ConfirmationTextsDto(
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

  protected List<ActionDto> getActions(String listId, Object uiInstance) {
    List<ActionDto> actions = getActions(uiInstance);
    if (!Strings.isNullOrEmpty(listId))
      actions =
          actions.stream()
              .map(
                  a ->
                      new ActionDto(
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
                          ActionPositionDto.Right,
                          a.timeoutMillis(),
                          a.order()))
              .toList();
    if (canAdd(uiInstance)) {
      ActionDto action =
          new ActionDto(
              "__list__" + listId + "__new",
              null,
              getCaptionForNew(uiInstance),
              ActionTypeDto.Primary,
              new ActionThemeVariantDto[0],
              true,
              false,
              false,
              false,
              null,
              ActionTargetDto.View,
              null,
              null,
              null,
              null,
              false,
              ActionPositionDto.Right,
              0,
              Integer.MAX_VALUE);
      actions = Stream.concat(actions.stream(), Stream.of(action)).toList();
    }
    if (canDelete(uiInstance)) {
      ActionDto action =
          new ActionDto(
              "__list__" + listId + "__delete",
              null,
              getCaptionForDelete(uiInstance),
              ActionTypeDto.Primary,
              new ActionThemeVariantDto[0],
              true,
              false,
              true,
              true,
              new ConfirmationTextsDto(
                  "Please confirm",
                  "Are you sure you want to delete the selected rows",
                  "Yes, delete them"),
              ActionTargetDto.View,
              null,
              null,
              null,
              null,
              false,
              ActionPositionDto.Right,
              0,
              Integer.MAX_VALUE);
      actions = Stream.concat(actions.stream(), Stream.of(action)).toList();
    }
    return actions;
  }

  public List<ActionDto> getActions(Object uiInstance) {
    return getActionsWithPrefix("", uiInstance);
  }

  private List<ActionDto> getActionsWithPrefix(String prefix, Object uiInstance) {
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
    List<ActionDto> actions =
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
    actions.sort(Comparator.comparing(ActionDto::caption));
    actions.sort(Comparator.comparing(ActionDto::order));
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
