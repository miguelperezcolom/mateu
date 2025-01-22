package io.mateu.uidl.data;

import io.mateu.uidl.annotations.ActionTarget;

public class CloseModal<T> {

  private final T result;
  private final ActionTarget actionTarget;

  public T getResult() {
    return result;
  }

  public ActionTarget getActionTarget() {
    return actionTarget;
  }

  public CloseModal(T result) {
    this.result = result;
    this.actionTarget = ActionTarget.Component;
  }

  public CloseModal(T result, ActionTarget actionTarget) {
    this.result = result;
    this.actionTarget = actionTarget;
  }
}
