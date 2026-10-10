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
    Object savedId;
    try {
      savedId =
          "save".equals(persistAction)
              ? orchestrator.save(httpRequest)
              : orchestrator.create(httpRequest);
    } catch (
        io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.StaleEditException
            conflict) {
      // concurrent edit: don't persist — open the conflict dialog instead (its buttons bubble to
      // the editor component, which advertises save and cancel-edit)
      return io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.conflictDialog(
          "Este registro ha cambiado mientras lo editabas. Puedes recargar para ver los cambios"
              + " (perdiendo los tuyos) o sobrescribir con tu versión.",
          "cancel-edit",
          persistAction,
          null);
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
    var result =
        CrudActionResult.of(persistAction)
            .withSavedId(savedId)
            .withMessage(
                Message.builder()
                    .variant(
                        said == null ? NotificationVariant.success : NotificationVariant.contrast)
                    .text(said == null ? "Item saved successfully" : said.toString())
                    .build());
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
      var state = httpRequest.runActionRq().componentState();
      if (state != null) {
        typed.putAll((Map<String, Object>) state);
      }
      var message =
          failure.getMessage() != null && !failure.getMessage().isBlank()
              ? failure.getMessage()
              : "The record could not be saved";
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
      // nothing takes focus: tell a screen-reader user too
      responses.add(UICommand.announceAssertive(message));
      return responses;
    } catch (RuntimeException cannotRebuild) {
      return null;
    }
  }
}
