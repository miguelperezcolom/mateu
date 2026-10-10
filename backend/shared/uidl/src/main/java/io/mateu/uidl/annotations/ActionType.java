package io.mateu.uidl.annotations;

/**
 * @deprecated nothing reads it. Use {@link Toolbar} or {@link Button} on the method to place an
 *     action, and {@link Hidden} to hide one.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public enum ActionType {
  Section,
  Main,
  Button,
  Hidden
}
