package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ButtonsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.AnnotatedElement;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * The {@code @Button}s a crud's edit / creation form declares, rendered under the form.
 *
 * <p>They are actions that only make sense while editing — insert something into the text,
 * translate it, refresh a preview —: they change the form's values and the user then saves. So they
 * cannot run against the editor on its own (its answer would replace the crud's form with a bare
 * page of the editor, without Cancel/Save). Like the form's save, they BUBBLE to the crud, carrying
 * the form's values ({@code initiatorState}), under an id the crud recognises: {@link
 * #EDIT_PREFIX}/{@link #CREATE_PREFIX} + the method (or field) name. The crud rebuilds the editor
 * from those values, runs the method and answers the form's new values in place (see {@code
 * ActionOnEditorActionHandler}).
 *
 * <p>An editor that supplies its own buttons ({@link ButtonsSupplier}) gets them as they are: their
 * action ids are the developer's.
 */
public final class EditorButtons {

  /** The id prefix of an edit form's button: {@code action-on-editor-<method>}. */
  public static final String EDIT_PREFIX = "action-on-editor-";

  /** The id prefix of a creation form's button: {@code action-on-creation-form-<method>}. */
  public static final String CREATE_PREFIX = "action-on-creation-form-";

  public static String prefix(boolean isCreation) {
    return isCreation ? CREATE_PREFIX : EDIT_PREFIX;
  }

  /**
   * The editor's buttons — the same ones a plain form renders ({@code @Button} fields and methods,
   * minus the hidden, the projected-out and the unauthorised), their actions renamed to bubble.
   */
  public static List<UserTrigger> buttons(
      boolean isCreation, Object editor, HttpRequest httpRequest) {
    var buttons = ReflectionPageMapper.buttonsOf(editor, httpRequest);
    if (editor instanceof ButtonsSupplier) {
      return buttons;
    }
    var prefix = prefix(isCreation);
    var renamed = new ArrayList<UserTrigger>();
    for (var trigger : buttons) {
      if (trigger instanceof Button button) {
        renamed.add(rename(prefix, button));
      } else if (trigger instanceof ButtonGroup group) {
        renamed.add(
            ButtonGroup.builder()
                .id(group.id())
                .label(group.label())
                .iconOnLeft(group.iconOnLeft())
                .iconOnRight(group.iconOnRight())
                .separatorBefore(group.separatorBefore())
                .buttons(
                    group.buttons() == null
                        ? List.of()
                        : group.buttons().stream().map(b -> rename(prefix, b)).toList())
                .build());
      } else {
        renamed.add(trigger);
      }
    }
    return renamed;
  }

  /**
   * The actions behind those buttons: what the editor's {@code @Action} says (confirmation,
   * validation, shortcut…) — or, without one, validated, as a plain form advertises a bare
   * {@code @Button} — always bubbling to the crud.
   */
  public static List<Action> actions(boolean isCreation, Object editor) {
    if (editor instanceof ButtonsSupplier) {
      return List.of();
    }
    var prefix = prefix(isCreation);
    return Stream.concat(
            getAllFields(editor.getClass()).stream()
                .filter(
                    field ->
                        MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Button.class))
                .map(field -> action(prefix + field.getName(), field)),
            getAllMethods(editor.getClass()).stream()
                .filter(
                    method ->
                        MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Button.class))
                .map(method -> action(prefix + method.getName(), method)))
        .toList();
  }

  /** Whether the action runs only on a valid form — the same rule its advertised action follows. */
  public static boolean requiresValidation(AnnotatedElement element) {
    var declared = MetaAnnotations.find(element, io.mateu.uidl.annotations.Action.class);
    return declared == null || declared.validationRequired();
  }

  private static Action action(String id, AnnotatedElement element) {
    var declared = MetaAnnotations.find(element, io.mateu.uidl.annotations.Action.class);
    var action =
        declared != null ? Action.of(declared) : Action.builder().validationRequired(true).build();
    return action.withId(id).withBubble(true);
  }

  private static Button rename(String prefix, Button button) {
    return button.actionId() == null
        ? button
        : button.toBuilder().actionId(prefix + button.actionId()).build();
  }

  private EditorButtons() {}
}
