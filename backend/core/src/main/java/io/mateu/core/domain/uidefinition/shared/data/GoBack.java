package io.mateu.core.domain.uidefinition.shared.data;

import io.mateu.dtos.ResultType;

public class GoBack {

  private final ResultType resultType;
  private final String message;

  public GoBack() {
    resultType = ResultType.Success;
    message = null;
  }

  public GoBack(ResultType resultType, String message) {
    this.resultType = resultType;
    this.message = message;
  }

  public ResultType getResultType() {
    return resultType;
  }

  public String getMessage() {
    return message;
  }
}