package io.mateu.core.domain.uidefinition.shared.annotations;

/**
 * Deferred means to be applied after we get the result (which will be ignored) in the frontend.
 * This is used to avoid opening a tab/window in case the call fails
 */
public enum ActionTarget {
  View,
  Message,
  NewModal,
  NewTab,
  NewWindow,
  LeftDrawer,
  RightDrawer,
  NewJourney,
  Deferred,
  DeferredNewTab,
  DeferredNewWindow,
  Component,
  Header,
  Footer,
  Main,
  Left,
  Right
}
