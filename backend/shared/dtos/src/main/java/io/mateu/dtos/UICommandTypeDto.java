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
  AgentPush,
  /**
   * The whole current state of a long-running task (data: {@link ProgressDto}) — renderers upsert
   * it in their task center by {@code taskId}.
   */
  Progress,
  /**
   * The notification inbox changed (data: {@link NotificationsChangedDto}) — on the live-updates
   * stream, only to the sessions of the principal the change is for.
   */
  NotificationsChanged
}
