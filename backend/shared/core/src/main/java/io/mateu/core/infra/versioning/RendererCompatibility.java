package io.mateu.core.infra.versioning;

import io.mateu.dtos.UIIncrementDto;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;

/**
 * Reads the {@value #HEADER} request header every first-party renderer sends ({@code
 * <name>/<version> wire/<major>.<minor>}, e.g. {@code vaadin/3.0.0 wire/3.0}) and warns, once per
 * distinct value, when the renderer was built for another wire major than this server speaks. The
 * renderer shows its own message to the user; this is the operator's side of it. Nothing is
 * refused: a renderer of another major may still render most screens.
 */
@Slf4j
public final class RendererCompatibility {

  /** The request header naming the renderer. */
  public static final String HEADER = "X-Mateu-Renderer";

  private static final Pattern WIRE = Pattern.compile("wire/(\\d+)\\.(\\d+)");

  /** How many distinct renderer values are remembered (and warned about) per process. */
  static final int MAX_REMEMBERED = 100;

  private static final Set<String> WARNED = ConcurrentHashMap.newKeySet();

  private RendererCompatibility() {}

  /** Checks one request's header value (null when the request carried none). */
  public static void check(String headerValue) {
    if (!isMismatch(headerValue)) {
      return;
    }
    var value = headerValue.trim();
    if (value.length() > 200) {
      value = value.substring(0, 200);
    }
    if (WARNED.size() >= MAX_REMEMBERED || !WARNED.add(value)) {
      return;
    }
    log.warn(
        "Renderer '{}' speaks another wire major than this server ({}). Upgrade the renderer or the"
            + " server so their majors match.",
        value.replaceAll("[\\r\\n]", " "),
        UIIncrementDto.WIRE_VERSION);
  }

  /** Whether the header names a wire whose major differs from this server's. */
  static boolean isMismatch(String headerValue) {
    if (headerValue == null || headerValue.isBlank()) {
      return false;
    }
    var matcher = WIRE.matcher(headerValue);
    if (!matcher.find()) {
      return false;
    }
    var serverMajor = UIIncrementDto.WIRE_VERSION.split("\\.")[0];
    return !matcher.group(1).equals(serverMajor);
  }

  /** Forgets the values already warned about (tests). */
  static void reset() {
    WARNED.clear();
  }
}
