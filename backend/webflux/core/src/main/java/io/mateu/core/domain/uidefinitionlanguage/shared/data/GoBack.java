package io.mateu.core.domain.uidefinitionlanguage.shared.data;

import io.mateu.dtos.ResultType;

public class GoBack<T> {

  private final ResultType resultType;
  private final String message;
  private final T data;
  private final String selector;

  public GoBack() {
    resultType = ResultType.Success;
    selector = null;
    message = null;
    data = null;
  }

  public GoBack(ResultType resultType, String message) {
    this.resultType = resultType;
    this.message = message;
    selector = null;
    data = null;
  }

  public GoBack(ResultType resultType, String message, T data) {
    this.resultType = resultType;
    this.message = message;
    this.data = data;
    selector = null;
  }

  public GoBack(ResultType resultType, String message, String selector, T data) {
    this.resultType = resultType;
    this.message = message;
    this.data = data;
    this.selector = selector;
  }

  public ResultType getResultType() {
    return resultType;
  }

  public String getMessage() {
    return message;
  }

  public T getData() {
    return data;
  }

  public GoBack(ResultType resultType, String message, T data, String selector) {
    this.resultType = resultType;
    this.message = message;
    this.data = data;
    this.selector = selector;
  }
}
