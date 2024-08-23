package io.mateu.dtos;

/**
 * A message to be shown to the user
 *
 * @param type Message type: error, info, warning, ...
 * @param title The message title
 * @param text The message text
 */
public record Message(
        ResultType type,
        String title,
        String text
) {
}
