package io.mateu.sample1.actions;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

/**
 * Every trigger type on one page. Each trigger's action writes into a visible field, so a test
 * sees that it ran: OnLoad, OnValueChange (of {@code watched}), OnSuccess (after {@code ok}),
 * OnError (after {@code fail}) and OnCustomEvent ({@code lab-custom}, emitted by {@code emit}).
 */
@UI("/triggers-lab")
@Title("Triggers lab")
@Trigger(type = TriggerType.OnLoad, actionId = "loaded")
@Trigger(type = TriggerType.OnValueChange, actionId = "watchedChanged", propertyName = "watched")
@Trigger(type = TriggerType.OnSuccess, actionId = "afterOk", calledActionId = "ok")
@Trigger(type = TriggerType.OnError, actionId = "afterFail", calledActionId = "fail")
@Trigger(type = TriggerType.OnCustomEvent, actionId = "onCustom", eventName = "lab-custom")
@Getter
@Setter
public class TriggersLab {

  String watched = "";
  String onLoad = "";
  String onValueChange = "";
  String onSuccess = "";
  String onError = "";
  String onCustom = "";

  public TriggersLab loaded() {
    onLoad = "loaded";
    return this;
  }

  public TriggersLab watchedChanged() {
    onValueChange = "changed to " + watched;
    return this;
  }

  @Button
  @Label("Ok")
  public Message ok() {
    return new Message("ok ran");
  }

  public TriggersLab afterOk() {
    onSuccess = "after ok";
    return this;
  }

  @Button
  @Label("Fail")
  public Object fail() {
    throw new UserFacingException("fail ran");
  }

  public TriggersLab afterFail() {
    onError = "after fail";
    return this;
  }

  @Button
  @Label("Emit")
  public UICommand emit() {
    return UICommand.dispatchEvent("lab-custom", Map.of("k", "v"));
  }

  public TriggersLab onCustom() {
    onCustom = "custom heard";
    return this;
  }
}
