package io.mateu.uidl.security;

/** Where a {@link SignInProvider} is offered. */
public enum SignInPlatform {
  /** The web renderers (Vaadin, Redwood) in a browser. */
  web,
  /** The Mateu phone app (React Native). */
  mobile,
  /** The Mateu desktop app (IntelliJ-based). */
  desktop
}
