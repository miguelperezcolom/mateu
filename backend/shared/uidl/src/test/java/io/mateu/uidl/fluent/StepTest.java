package io.mateu.uidl.fluent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;

import io.mateu.uidl.data.UICommandType;
import org.junit.jupiter.api.Test;

/**
 * The v0 flow-step model (coherence-plan #3): every step lowers to exactly one existing {@link
 * io.mateu.uidl.data.UICommand}, so a flow built from these verbs runs on the current wire with no
 * renderer change. These tests pin each verb's lowering.
 */
class StepTest {

  @Test
  void navigateLowersToNavigateTo() {
    var c = new Step.Navigate("/orders").toCommand();
    assertEquals(UICommandType.NavigateTo, c.type());
    assertEquals("/orders", c.data());
  }

  @Test
  void emitLowersToDispatchEventCarryingEventAndPayload() {
    var c = new Step.Emit("saved", java.util.Map.of("id", 7)).toCommand();
    assertEquals(UICommandType.DispatchEvent, c.type());
    var event = assertInstanceOf(CustomEvent.class, c.data());
    assertEquals("saved", event.eventName());
    assertEquals(java.util.Map.of("id", 7), event.detail());
  }

  @Test
  void emitWithoutPayloadHasNullDetail() {
    var c = new Step.Emit("ping").toCommand();
    assertEquals(UICommandType.DispatchEvent, c.type());
    assertNull(assertInstanceOf(CustomEvent.class, c.data()).detail());
  }

  @Test
  void closeOverlayLowersToCloseModal() {
    assertEquals(UICommandType.CloseModal, new Step.CloseOverlay().toCommand().type());
    assertNull(new Step.CloseOverlay().toCommand().data());
  }

  @Test
  void closeOverlayWithEventEmitsAResultEvent() {
    var c = new Step.CloseOverlay("contact-saved").toCommand();
    assertEquals(UICommandType.CloseModal, c.type());
    assertEquals("contact-saved", assertInstanceOf(CustomEvent.class, c.data()).eventName());
  }

  @Test
  void runActionLowersToRunAction() {
    var c = new Step.RunAction("refresh").toCommand();
    assertEquals(UICommandType.RunAction, c.type());
    assertEquals(java.util.Map.of("actionId", "refresh"), c.data());
  }

  @Test
  void markCleanAndDirtyLowerToTheirCommands() {
    assertEquals(UICommandType.MarkAsClean, new Step.MarkClean().toCommand().type());
    assertEquals(UICommandType.MarkAsDirty, new Step.MarkDirty().toCommand().type());
  }
}
