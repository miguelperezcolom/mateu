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
  MarkAsClean,
  /** Triggers a file download in the browser; data must be a {@link FileDownload} instance. */
  DownloadFile,
  /**
   * Announces a text to assistive technology through the page's live region (the Redwood {@code
   * announcement} slot); data must be an {@link Announcement}.
   */
  Announce,
  /**
   * Prints the current page with the browser's print dialog; the renderers' print stylesheet hides
   * the app chrome (navigation, toolbars, overlays). No data.
   */
  Print
}
