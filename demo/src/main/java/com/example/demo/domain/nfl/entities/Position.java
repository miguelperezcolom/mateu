package com.example.demo.domain.nfl.entities;

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

  private final String displayName;

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
