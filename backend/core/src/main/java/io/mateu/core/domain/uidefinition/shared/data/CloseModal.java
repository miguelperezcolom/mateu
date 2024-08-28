package io.mateu.core.domain.uidefinition.shared.data;

public class CloseModal<T> {

  private final T data;

  public T getData() {
    return data;
  }

  public CloseModal(T data) {
    this.data = data;
  }

}
