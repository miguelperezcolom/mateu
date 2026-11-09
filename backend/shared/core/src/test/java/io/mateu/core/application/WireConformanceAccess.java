package io.mateu.core.application;

import com.fasterxml.jackson.databind.JsonNode;

/** The wire corpus's normaliser, for the other corpora that embed wire (the bundle corpus). */
public final class WireConformanceAccess {
  private WireConformanceAccess() {}

  public static JsonNode normalise(JsonNode node) {
    return WireConformanceTest.normalise(node);
  }
}
