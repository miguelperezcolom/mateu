package io.mateu.dtos;

/**
 * Client side listener definition
 *
 * @param eventName the event name
 * @param actionName the action to trigger
 * @param js the js to run
 */
public record Listener(String eventName, String actionName, String js) {}
