package io.mateu.dtos;

/**
 * How long a message stays: {@code toast} goes away on its own, {@code sticky} stays until the user
 * dismisses it, {@code inbox} is a toast that also lands in the notification inbox.
 */
public enum MessagePersistenceDto {
  toast,
  sticky,
  inbox
}
