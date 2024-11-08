package io.mateu.uidl.data;

public class CloseModal<T> {

  private final T result;

  public T getResult() {
    return result;
  }

  public CloseModal(T result) {
    this.result = result;
  }
}
