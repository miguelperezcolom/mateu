package io.mateu.uidl.data;

public enum UICommandType {
  CloseModal,
  SetWindowTitle,
  SetFavicon,
  NavigateTo,
  RunAction,
  AddContentToHead,
  AddContentToBody,
  PushStateToHistory,
  DispatchEvent,
    /** Marks the component as having unsaved changes, triggering a navigation-away confirmation. */
    MarkAsDirty,
    /** Clears the dirty state (e.g. after a successful save), suppressing the confirmation dialog. */
    MarkAsClean
}
