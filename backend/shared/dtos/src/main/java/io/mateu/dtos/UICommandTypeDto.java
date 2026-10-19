package io.mateu.dtos;

public enum UICommandTypeDto {
  CloseModal,
  SetWindowTitle,
  SetFavicon,
  NavigateTo,
  RunAction,
  AddContentToHead,
  AddContentToBody,
  PushStateToHistory,
  DispatchEvent,
  MarkAsDirty,
  MarkAsClean,
  DownloadFile,
  Announce,
  Print,
  UpdateHeaderValue,
  /**
   * A message an MCP caller sent to this UI session (live UI push): data is an {@link
   * AgentPushDto}. Only on the {@code _agent-channel} stream.
   */
  AgentPush
}
