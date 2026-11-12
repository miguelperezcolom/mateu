package io.mateu.test;

import io.mateu.uidl.annotations.Experimental;
import java.util.Map;

/**
 * A message (toast) the UI showed.
 *
 * @param variant its tone as the wire names it ({@code success}, {@code error}, {@code warning}…;
 *     empty when the server named none)
 * @param title its title, empty when none
 * @param text its text
 * @param wire the message as the wire carries it (undo action, duration…)
 */
@Experimental("test harness (3.0)")
public record Message(String variant, String title, String text, Map<String, Object> wire) {

  /**
   * Whether it is an error message.
   *
   * @return whether its variant is {@code error}
   */
  public boolean isError() {
    return "error".equalsIgnoreCase(variant);
  }

  @Override
  public String toString() {
    return (variant.isEmpty() ? "" : variant + ": ")
        + (title.isEmpty() ? "" : title + " — ")
        + text;
  }
}
