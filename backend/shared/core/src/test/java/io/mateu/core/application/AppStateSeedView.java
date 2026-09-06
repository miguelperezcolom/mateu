package io.mateu.core.application;

/**
 * A trivial view used by {@link AppStateSeedSyncTest}: it is bound to the {@code appstate-seed}
 * route in the test {@code routes.yaml}, which seeds the app state. A plain page with one field.
 */
public class AppStateSeedView {
  public String hello = "hi";
}
