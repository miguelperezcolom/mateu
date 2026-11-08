package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * The whole current state of one long-running task (the data of a {@code Progress} command). Every
 * command is self-contained: a renderer upserts its task center entry by {@code taskId}.
 *
 * @param taskId identifies the task (several can run at once)
 * @param title what the task is
 * @param text what it is doing now (or the outcome, once finished)
 * @param fraction 0..1, or null when the amount of work is unknown (indeterminate)
 * @param done items done, when the work is countable ("12 of 300")
 * @param total items in all, when the work is countable
 * @param state running | done | failed | cancelled
 * @param blocking the user should wait for it (a modal surface) rather than keep working
 * @param backgroundable a blocking task the user may move to the background
 * @param cancellable the user may cancel it ({@code _progress-cancel} with {@code taskId})
 * @param retryable a failed task may be re-run (the renderer re-dispatches the action that started
 *     it)
 * @param startedAt when it started (server epoch millis) — for the elapsed time
 * @param closeAfterSeconds how long a finished blocking surface stays before closing on its own
 * @param error what went wrong (state failed)
 * @param resultActions what the user can do with the result ("Open report")
 */
@Builder(toBuilder = true)
public record ProgressDto(
    String taskId,
    String title,
    String text,
    Double fraction,
    Integer done,
    Integer total,
    ProgressStateDto state,
    boolean blocking,
    boolean backgroundable,
    boolean cancellable,
    boolean retryable,
    Long startedAt,
    Integer closeAfterSeconds,
    String error,
    List<MessageActionDto> resultActions) {

  public ProgressDto {
    resultActions = resultActions != null ? List.copyOf(resultActions) : List.of();
  }
}
