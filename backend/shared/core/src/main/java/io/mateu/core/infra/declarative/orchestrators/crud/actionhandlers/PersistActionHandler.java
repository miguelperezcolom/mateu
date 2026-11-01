package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PersistActionHandler implements CrudOrchestratorActionHandler {

  /**
   * Request attribute a crud's {@code save}/{@code create} may set to replace the "Item saved
   * successfully" notification — e.g. "Sin cambios" when there was nothing to save.
   */
  public static final String SAVED_MESSAGE = "mateu.savedMessage";

  /**
   * The edit drawer's "Save and next" (the Redwood create-edit-drawer {@code
   * spPrimaryActionAndNext}): saves, then moves the drawer on to the next row of the listing.
   */
  public static final String SAVE_AND_NEXT = "save-and-next";

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "save".equals(actionId) || "create".equals(actionId) || SAVE_AND_NEXT.equals(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    var saveAndNext = SAVE_AND_NEXT.equals(actionId);
    if (saveAndNext && !orchestrator.display().saveAndNext().enabled()) {
      return null;
    }
    var persistAction = saveAndNext ? "save" : actionId;
    // a crud that may not create / edit refuses the write itself (403), not only its button
    if ("create".equals(persistAction)) {
      io.mateu.core.infra.declarative.orchestrators.crud.CrudWriteGate.checkCreate(orchestrator);
    } else {
      io.mateu.core.infra.declarative.orchestrators.crud.CrudWriteGate.checkEdit(orchestrator);
    }
    Object savedId;
    try {
      if (orchestrator.editInDrawer()) {
        // the drawer's form is not validated in the browser (see DrawerFormValidator)
        DrawerFormValidator.validate("create".equals(persistAction), httpRequest, orchestrator);
      }
      savedId =
          "save".equals(persistAction)
              ? orchestrator.save(httpRequest)
              : orchestrator.create(httpRequest);
    } catch (
        io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.StaleEditException
            conflict) {
      // concurrent edit: don't persist — open the conflict dialog instead. It lands on the crud
      // component, so its buttons carry the edit form's state (initiatorState) themselves.
      return io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.conflictDialog(
          "This record changed while you were editing it. Reload to see the changes (losing"
              + " yours) or overwrite them with your version.",
          "cancel-edit",
          persistAction,
          null,
          java.util.Map.of(
              "initiatorState",
              io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.editorState(
                  httpRequest)),
          httpRequest);
    } catch (RuntimeException failure) {
      // drawer mode: a failed save keeps the drawer open and shows WHY inside it (the Redwood
      // create-edit-drawer error banner), with the values the user typed
      if (orchestrator.editInDrawer() && orchestrator.display().errorBanner().shown()) {
        var banner = errorBanner(persistAction, failure, httpRequest, orchestrator);
        if (banner != null) {
          return banner;
        }
      }
      throw failure;
    }
    // What the save said, if it said something ({@link #SAVED_MESSAGE}): "Sin cambios" for a save
    // that found nothing to change, instead of claiming it saved.
    var said = httpRequest.getAttribute(SAVED_MESSAGE);
    var message =
        Message.builder()
            .variant(said == null ? NotificationVariant.success : NotificationVariant.contrast)
            .text(said == null ? "Item saved successfully" : said.toString());
    if (offersAddAnother(persistAction, orchestrator)) {
      // "Add another" belongs to the create flow: the record just created opens on its view, and
      // the toast confirming it offers to start the next one (the crud's "new"). Not on the view
      // of an existing record, where it used to sit next to Edit.
      message
          .undoLabel(orchestrator.addAnotherLabel())
          .undoActionId("new")
          .undoParameters(Map.of())
          .duration(10000);
    }
    var result =
        CrudActionResult.of(persistAction).withSavedId(savedId).withMessage(message.build());
    if (orchestrator.editInDrawer()) {
      if (saveAndNext) {
        var next = nextDrawer(savedId, httpRequest, orchestrator);
        if (next != null) {
          // the drawer stays open and is re-sent with the same id for the next row — the Add
          // fragment of an open overlay refreshes it in place — while the listing refreshes
          // through the same saved event the close would have emitted
          return List.of(
              result.messages().get(0),
              next,
              UICommand.markAsClean(),
              UICommand.dispatchEvent(Crud.SAVED_IN_DRAWER_EVENT));
        }
      }
      // drawer mode: persist, then close the drawer EMITTING the saved event — the listing
      // (which subscribes to it, see CrudTriggersBuilder) re-runs its search in place. No
      // navigation/re-render happens in this response: re-rendering the host here would kill
      // the drawer's owner before the close command finds the overlay.
      return List.of(
          result.messages().get(0),
          UICommand.markAsClean(),
          UICommand.closeModal(Crud.SAVED_IN_DRAWER_EVENT));
    }
    return result.withRoute("/" + savedId);
  }

  /**
   * Whether the confirmation of a save offers "Add another": only after CREATING a record on the
   * routed form (the drawer closes back onto the listing, whose New is right there), and only when
   * the crud can create.
   */
  static boolean offersAddAnother(String persistAction, Crud orchestrator) {
    return "create".equals(persistAction)
        && !orchestrator.editInDrawer()
        && !orchestrator.readOnly()
        && orchestrator.canCreate();
  }

  /**
   * A failure whose message was written for the user: a {@link io.mateu.uidl.UserFacingException},
   * or the validation refusal (the drawer's own check words it with the fields' labels).
   */
  private static boolean meantForTheUser(RuntimeException failure) {
    return failure instanceof io.mateu.uidl.UserFacingException
        || failure instanceof jakarta.validation.ConstraintViolationException;
  }

  /** The edit drawer for the row after the saved one, or null when it was the last. */
  private static Object nextDrawer(Object savedId, HttpRequest httpRequest, Crud orchestrator) {
    var nextId = orchestrator.nextIdAfter(savedId, httpRequest);
    if (nextId == null) {
      return null;
    }
    var editor = orchestrator.edit(orchestrator.toId(String.valueOf(nextId)), httpRequest);
    httpRequest.setAttribute("selectedItem", editor);
    return CrudDrawerBuilder.build(
        false, orchestrator.editLabel(), editor, orchestrator, httpRequest);
  }

  /**
   * The open drawer re-sent with an error banner over the form and the values the user typed, or
   * null when the form cannot be rebuilt (the failure then surfaces as usual).
   */
  @SuppressWarnings("unchecked")
  private static Object errorBanner(
      String persistAction, RuntimeException failure, HttpRequest httpRequest, Crud orchestrator) {
    try {
      var creation = "create".equals(persistAction);
      var editor =
          creation
              ? orchestrator.creationForm(httpRequest)
              : orchestrator.edit(
                  orchestrator.toId(
                      String.valueOf(CrudIdExtractor.extractId(orchestrator, httpRequest))),
                  httpRequest);
      Map<String, Object> typed =
          new LinkedHashMap<>(io.mateu.core.infra.declarative.FormViewModel.toMap(editor));
      // what the user typed: the drawer's form bubbles its save with it as initiatorState
      typed.putAll(
          io.mateu.core.infra.declarative.orchestrators.crud.CrudFormState.of(httpRequest));
      // through the error boundary like any failed action: a UserFacingException / validation as
      // written, anything else the generic text + a reference (logged at ERROR) — the raw message
      // of a store exception (an SQL statement, its values) used to be shown in the drawer
      var said =
          meantForTheUser(failure)
              ? failure.getMessage()
              : io.mateu.core.application.runaction.ErrorBoundary.toMessage(
                      failure, persistAction, httpRequest)
                  .text();
      var message = said != null && !said.isBlank() ? said : "The record could not be saved";
      var responses = new ArrayList<Object>();
      responses.add(
          CrudDrawerBuilder.build(
              creation,
              creation ? orchestrator.newLabel() : orchestrator.editLabel(),
              editor,
              orchestrator,
              httpRequest,
              typed,
              message));
      if (failure instanceof jakarta.validation.ConstraintViolationException violations) {
        // the refused fields are marked invalid on the form, as the browser's own check does
        var errors =
            DrawerFormValidator.fieldErrors(
                creation ? orchestrator.creationFormClass() : orchestrator.editorClass(),
                violations);
        if (!errors.isEmpty()) {
          responses.add(
              new io.mateu.dtos.UIFragmentDto(
                  CrudDrawerBuilder.FORM_ID,
                  null,
                  null,
                  Map.of("errors", errors, "_valid", false),
                  io.mateu.dtos.UIFragmentActionDto.Replace,
                  null));
        }
      }
      // nothing takes focus: tell a screen-reader user too
      responses.add(UICommand.announceAssertive(message));
      return responses;
    } catch (RuntimeException cannotRebuild) {
      return null;
    }
  }
}
