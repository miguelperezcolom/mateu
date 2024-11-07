package io.mateu.uidl.core.data;

public class CloseModal<T> {

  private final T result;

  public T getResult() {
    return result;
  }

  public CloseModal(T result) {
    this.result = result;
  }
}
