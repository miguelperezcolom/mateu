package io.mateu.core.infra;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * The ObjectMapper configuration of the Mateu wire (the DTOs exchanged with the renderers). Every
 * adapter and every place in core that writes the wire uses this one, instead of injecting "the"
 * application ObjectMapper — a bean the application owns and configures for its own purposes.
 */
public final class WireMapper {

  private static final ObjectMapper SHARED = create();

  private WireMapper() {}

  /** A new mapper with the wire configuration. */
  public static ObjectMapper create() {
    return new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
  }

  /** A shared instance (ObjectMapper is thread-safe once configured). Do not reconfigure it. */
  public static ObjectMapper shared() {
    return SHARED;
  }

  /**
   * One Server-Sent Event carrying {@code payload} as JSON: {@code data:<json>\n\n}. The renderers
   * read each event's {@code data:} line and parse it as a {@code UIIncrementDto}; the JSON is
   * single-line, so one {@code data:} line per event.
   */
  public static String sseEvent(Object payload) {
    try {
      return "data:" + SHARED.writeValueAsString(payload) + "\n\n";
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Could not serialize an SSE event", e);
    }
  }
}
