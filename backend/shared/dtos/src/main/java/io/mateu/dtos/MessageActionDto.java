package io.mateu.dtos;

import java.util.Map;
import lombok.Builder;

/**
 * An action offered by a message, a finished task or an inbox entry: {@code route} navigates,
 * otherwise {@code actionId} (with {@code parameters}) runs on the component that started it.
 * {@code style} is a hint: primary | secondary | danger | undo (an undo with no label is labelled
 * by the renderer's own "Undo").
 */
@Builder
public record MessageActionDto(
    String label, String actionId, Map<String, Object> parameters, String route, String style) {}
