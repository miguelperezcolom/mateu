package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.toView;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;

import io.mateu.core.application.security.ActionMethods;
import io.mateu.core.domain.ComponentState;
import io.mateu.core.domain.out.fragmentmapper.mappers.ServerConstraintCheck;
import io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudWriteGate;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.EditorButtons;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * A {@code @Button} of the crud's edit or creation form ({@link EditorButtons}): the form bubbles
 * it here with its values ({@code initiatorState}), the editor is rebuilt from them and the method
 * (or {@code Runnable}/{@code Callable} field) runs on it.
 *
 * <p>When the method answers the editor ({@code return this}), nothing, messages, or a list of
 * those ({@code List.of(this, Message.success(...))}), the form stays where it is — in edit (or
 * creation) mode, with its Cancel/Save — and only takes the editor's new values: a state fragment
 * on the routed form page, the drawer re-sent in place in edit-in-drawer mode. The user then saves
 * as usual. Any other answer (a navigation, a dialog, a download…) decides what happens itself.
 */
public class ActionOnEditorActionHandler implements CrudOrchestratorActionHandler {

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return actionId.startsWith(EditorButtons.EDIT_PREFIX)
        || actionId.startsWith(EditorButtons.CREATE_PREFIX);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var isCreation = actionId.startsWith(EditorButtons.CREATE_PREFIX);
    var name = actionId.substring(EditorButtons.prefix(isCreation).length());
    if (isCreation) {
      CrudWriteGate.checkCreate(orchestrator);
    } else {
      CrudWriteGate.checkEdit(orchestrator);
    }
    httpRequest.setAttribute(ValidationMapper.FOR_CREATION_FORM, isCreation);
    Class<?> formClass = isCreation ? orchestrator.creationFormClass() : orchestrator.editorClass();
    Object editor = toView(httpRequest, formClass);

    var result = invoke(name, editor, isCreation, httpRequest);

    if (!onlyFormAndMessages(result, formClass)) {
      return result;
    }
    var refreshed = formIn(result, formClass);
    if (refreshed == null) {
      refreshed = editor;
    }
    var responses = new ArrayList<Object>();
    if (orchestrator.editInDrawer()) {
      // the drawer carries the same id: re-sending it refreshes it in place, values and all
      httpRequest.setAttribute("selectedItem", refreshed);
      responses.add(
          CrudDrawerBuilder.build(
              isCreation,
              isCreation ? orchestrator.newLabel() : orchestrator.editLabel(),
              refreshed,
              orchestrator,
              httpRequest));
    } else {
      responses.add(
          new UIFragmentDto(
              CrudTargetComponentId.form(httpRequest, isCreation),
              null,
              ComponentState.getState(refreshed, httpRequest),
              null,
              UIFragmentActionDto.Replace,
              null));
    }
    responses.addAll(messagesIn(result));
    return responses;
  }

  private static Object invoke(
      String name, Object editor, boolean isCreation, HttpRequest httpRequest) {
    Method method =
        getAllMethods(editor.getClass()).stream()
            .filter(m -> name.equals(m.getName()))
            .filter(m -> MetaAnnotations.isPresent(m, io.mateu.uidl.annotations.Button.class))
            .findFirst()
            .orElse(null);
    if (method != null) {
      if (!ActionMethods.isInvocable(method, editor, httpRequest)) {
        throw ActionMethods.notAnAction(editor.getClass(), name);
      }
      ActionMethods.checkAccess(method, editor.getClass(), httpRequest);
      if (EditorButtons.requiresValidation(method)) {
        ServerConstraintCheck.enforce(editor, httpRequest, isCreation);
      }
      method.setAccessible(true);
      var args = new Object[method.getParameterCount()];
      for (int i = 0; i < args.length; i++) {
        var type = method.getParameterTypes()[i];
        args[i] = type.isInstance(httpRequest) ? httpRequest : null;
      }
      try {
        return method.invoke(editor, args);
      } catch (InvocationTargetException e) {
        var cause = e.getCause() != null ? e.getCause() : e;
        if (cause instanceof RuntimeException re) {
          throw re;
        }
        if (cause instanceof Error err) {
          throw err;
        }
        throw new RuntimeException(cause);
      } catch (IllegalAccessException e) {
        throw new RuntimeException("Cannot invoke " + method, e);
      }
    }
    Field field = getFieldByName(editor.getClass(), name);
    if (field != null
        && MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Button.class)
        && ActionMethods.isInvocable(field)) {
      ActionMethods.checkAccess(field, editor.getClass(), httpRequest);
      if (EditorButtons.requiresValidation(field)) {
        ServerConstraintCheck.enforce(editor, httpRequest, isCreation);
      }
      try {
        field.setAccessible(true);
        var value = field.get(editor);
        if (value instanceof Callable<?> callable) {
          return callable.call();
        }
        if (value instanceof Runnable runnable) {
          runnable.run();
          return null;
        }
        return value;
      } catch (RuntimeException e) {
        throw e;
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    // an id naming no button of the form is wire input naming nothing: refused like any other
    throw ActionMethods.noSuchAction(editor.getClass(), name);
  }

  /** Nothing, the form, messages, or a collection of only those. */
  private static boolean onlyFormAndMessages(Object result, Class<?> formClass) {
    if (result instanceof Collection<?> items) {
      return items.stream().allMatch(item -> isFormOrMessage(item, formClass));
    }
    return result == null || isFormOrMessage(result, formClass);
  }

  private static boolean isFormOrMessage(Object item, Class<?> formClass) {
    return item instanceof Message || formClass.isInstance(item);
  }

  private static Object formIn(Object result, Class<?> formClass) {
    if (result instanceof Collection<?> items) {
      return items.stream().filter(formClass::isInstance).findFirst().orElse(null);
    }
    return formClass.isInstance(result) ? result : null;
  }

  private static List<Message> messagesIn(Object result) {
    if (result instanceof Collection<?> items) {
      return items.stream().filter(Message.class::isInstance).map(Message.class::cast).toList();
    }
    return result instanceof Message message ? List.of(message) : List.of();
  }
}
