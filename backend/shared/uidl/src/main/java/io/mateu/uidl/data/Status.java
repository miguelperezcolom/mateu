package io.mateu.uidl.data;

import lombok.Builder;

/**
 * A value with a tone, rendered as a status chip: {@link StatusType} (success, danger…), the text
 * shown ({@code message}) and the raw value. A row field typed {@code Status} needs no annotation;
 * for a plain field use the {@code @Status} annotation, which maps values to tones.
 */
@Builder
public record Status(StatusType type, String message, String value) {
  public Status(StatusType type, String message) {
    this(type, message, message);
  }
}
