package io.mateu.uidl.data;

public enum NotificationVariant {
  success,
  warning,
  error,
  primary,
  contrast,
  /** A neutral informational toast — the same variant the .NET and Python ports send as "info". */
  info
}
