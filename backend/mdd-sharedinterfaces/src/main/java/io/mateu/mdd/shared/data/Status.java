package io.mateu.mdd.shared.data;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class Status {

  private StatusType type;

  private String message;

  public Status(StatusType type, String message) {
    this.type = type;
    this.message = message;
  }
}
