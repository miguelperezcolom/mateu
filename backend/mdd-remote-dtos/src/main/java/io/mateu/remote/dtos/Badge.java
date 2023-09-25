package io.mateu.remote.dtos;

import lombok.Getter;

@Getter
public class Badge {

  private BadgeType type;

  private String message;

  public Badge(BadgeType type, String message) {
    this.type = type;
    this.message = message;
  }

  public Badge() {}
}
