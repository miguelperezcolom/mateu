package io.mateu.sample1.actions;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

/**
 * The walkthrough of what an action method can be and return (design/walkthrough/actions.md):
 * every button here is one row of that matrix, driven from a real browser by
 * {@code e2e/tests/shared/actions-lab.spec.ts} on all five adapters.
 *
 * <p>{@code outcome} is the visible trace: an action that returns {@code this} writes what it did
 * there, so a test sees the new STATE arrive on screen and not only a toast.
 */
@UI("/actions-lab")
@Title("Actions lab")
@Getter
@Setter
public class ActionsLab {

  String name = "";
  int counter = 0;
  String outcome = "";

  // ── where an action lives ──────────────────────────────────────────────────

  @Button
  public Message greet() {
    return new Message("Hello " + name + "!");
  }

  @Toolbar
  public ActionsLab count() {
    counter++;
    outcome = "counted " + counter;
    return this;
  }

  @Button
  @Action(shortcut = "ctrl+alt+k")
  public Message shortcut() {
    return new Message("Shortcut ran");
  }

  @Button
  @Label("Danger")
  @Action(
      confirmationRequired = true,
      confirmationTitle = "Really?",
      confirmationMessage = "This is the danger zone",
      confirmationText = "Do it",
      confirmationDenialText = "Keep it")
  public ActionsLab danger() {
    outcome = "danger done";
    return this;
  }

  @Button
  @Label("Needs a name")
  @Action(validationRequired = true)
  public Message needsName() {
    if (name == null || name.isBlank()) {
      throw new UserFacingException("Name required", "Type a name first");
    }
    return new Message("Validated " + name);
  }

  // ── what an action returns ─────────────────────────────────────────────────

  @Button
  @Label("Go to counter")
  public URI goAway() {
    return URI.create("/fluent-counter");
  }

  @Button
  public List<Object> deleteWithUndo() {
    outcome = "deleted";
    return List.of(this, Message.undoable("Item 7 deleted", "restore", Map.of("itemId", "7")));
  }

  /** The undo of {@link #deleteWithUndo()}: reached only through the toast's Undo control. */
  public ActionsLab restore(HttpRequest httpRequest) {
    Object id = httpRequest.runActionRq().parameters().get("itemId");
    outcome = "restored " + id;
    return this;
  }

  @Button
  public PageBanner banner() {
    return new PageBanner(BannerTheme.SUCCESS, "Checks passed", "System is healthy");
  }

  @Button
  public List<Object> appendBanner() {
    counter++;
    return List.of(
        this,
        PageBanners.append(new PageBanner(BannerTheme.WARNING, "Appended " + counter, "One more")));
  }

  @Button
  public List<Object> stateAndEvent() {
    counter++;
    outcome = "state+event " + counter;
    return List.of(this, UICommand.dispatchEvent("lab-event", Map.of("n", counter)));
  }

  @Button
  public List<UICommand> commands() {
    return List.of(
        UICommand.announce("Announced politely"),
        UICommand.announceAssertive("Announced assertively"),
        UICommand.pushStateToHistory("/actions-lab?pushed=1"));
  }

  @Button
  public UICommand runGreet() {
    return UICommand.runAction("greet");
  }

  @Button
  public UICommand markDirty() {
    return UICommand.markAsDirty();
  }

  @Button
  public UICommand markClean() {
    return UICommand.markAsClean();
  }

  @Button
  public UICommand navigateCommand() {
    return UICommand.navigateTo("/fluent-counter");
  }

  @Button
  @Label("Open another view")
  public ReturnedView openAnother() {
    return new ReturnedView("from the lab");
  }

  @Button
  public UICommand download() {
    return UICommand.downloadFile(
        "hello.txt", "text/plain", "Hello from Mateu".getBytes(StandardCharsets.UTF_8));
  }

  // ── when an action fails ───────────────────────────────────────────────────

  @Button
  public Object userError() {
    throw new UserFacingException("Not allowed", "You cannot do that here");
  }

  @Button
  public Object crash() {
    throw new IllegalStateException("internal detail that must not leak");
  }

  @Button
  @Action(timeoutMillis = 800)
  public Message tooSlow() throws InterruptedException {
    Thread.sleep(4000);
    return new Message("too late");
  }
}
