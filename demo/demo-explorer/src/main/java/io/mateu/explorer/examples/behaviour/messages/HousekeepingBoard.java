package io.mateu.explorer.examples.behaviour.messages;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Returning a {@link Message} shows a toast: {@code success}, {@code warning}, {@code contrast}
 * close by themselves; an {@code error} STAYS (with a ✕) so it is not missed. {@code
 * Message.undoable(text, actionId, params)} adds an Undo button that runs {@code actionId} with
 * those parameters — the undo action is an ordinary {@code @Action}, reached only from the toast.
 */
@Title("Housekeeping")
public class HousekeepingBoard {

  @ReadOnly String room214 = "Dirty";

  @Button
  Message success() {
    return Message.success("Room 118 inspected");
  }

  @Button
  Message warning() {
    return Message.warning("Room 305 is late");
  }

  @Button
  Message error() {
    return Message.error("The minibar sensor of 214 is offline");
  }

  @Button
  List<Object> markClean() {
    room214 = "Clean";
    return List.of(this, Message.undoable("Room 214 marked clean", "restore", Map.of("status", "Dirty")));
  }

  @Action
  HousekeepingBoard restore(HttpRequest httpRequest) {
    room214 = (String) httpRequest.runActionRq().parameters().get("status");
    return this;
  }
}
