package io.mateu.dtos;

/**
 * The idle-session warning: after {@code timeoutSeconds} without activity (any tab) a modal counts
 * down {@code warningSeconds}; "Stay signed in" runs {@code keepAliveActionId} (app-level), "Sign
 * out" goes to {@code signOutUrl} (a full page load).
 */
public record IdleSessionDto(
    int timeoutSeconds, int warningSeconds, String signOutUrl, String keepAliveActionId) {}
