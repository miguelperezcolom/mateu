package io.mateu.uidl.annotations;

/**
 * Deferred means to be applied after we get the result (which will be ignored) in the frontend.
 * This is used to avoid opening a tab/window in case the call fails
 */
public enum ActionTarget {
  Self,
  View,
  Message,
  NewModal,
  NewTab,
  NewWindow,
  LeftDrawer,
  RightDrawer,
  NewJourney,
  Deferred, // used for urls
  DeferredNewTab, // used for urls
  DeferredNewWindow, // used for urls
  Component,
  Header,
  Footer,
  Main,
  Left,
  Right
}
