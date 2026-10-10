package io.mateu.dtos;

/**
 * Client side listener definition
 *
 * @param eventName the event name
 * @param actionName the action to trigger
 * @param js the js to run
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record ListenerDto(String eventName, String actionName, String js) {}
