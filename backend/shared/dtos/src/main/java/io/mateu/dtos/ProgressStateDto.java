package io.mateu.dtos;

/** Where a task reported by a {@code Progress} command is in its life. */
public enum ProgressStateDto {
  running,
  done,
  failed,
  cancelled
}
