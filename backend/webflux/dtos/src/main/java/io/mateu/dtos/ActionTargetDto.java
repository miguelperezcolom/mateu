package io.mateu.dtos;

public enum ActionTargetDto {
  Self,
  View,
  Message,
  NewModal,
  NewTab,
  NewWindow,
  LeftDrawer,
  RightDrawer,
  NewJourney,
  Deferred, // deferred used when returning a URL
  DeferredNewTab,
  DeferredNewWindow,
  Component,
  Header,
  Footer,
  Main,
  Left,
  Right
}
