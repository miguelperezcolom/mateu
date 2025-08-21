package io.mateu.dtos;

/**
 * A button
 *
 * @param actionId This action targetId
 * @param timeoutMillis Run this action automatically after a timeout
 * @param times Run this action for indicated times
 */
public record OnLoadTriggerDto(String actionId, int timeoutMillis, int times, String condition)
    implements TriggerDto {}
