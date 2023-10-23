package com.example.demoremote.domains.nfl.entities;

import io.mateu.mdd.shared.data.StatusType;

public enum Position {
  RunningBack("Running Back"),
  Safety("Safety"),
  Guard("Guard"),
  WideReceiver("Wide Receiver"),
  Cornerback("Cornerback"),
  DefensiveEnd("Defensive End"),
  TightEnd("Tight End"),
  Linebacker("Linebacker"),
  DefensiveTackle("Defensive Tackle"),
  OffensiveTackle("Offensive Tackle"),
  LongSnapper("Long Snapper"),
  PlaceKicker("Place Kicker"),
  Quarterback("Quarterback"),
  Center("Center"),
  Punter("Punter"),
  Fullback("Fullback");

  private String displayName;

  Position(String displayName) {
    this.displayName = displayName;
  }

  public static Position getEnum(String value) {
    for (Position v : values()) if (v.displayName.equalsIgnoreCase(value)) return v;
    throw new IllegalArgumentException();
  }

  // Optionally and/or additionally, toString.
  @Override
  public String toString() {
    return displayName;
  }
}
