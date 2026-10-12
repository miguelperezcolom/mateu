package io.mateu.dtos;

/**
 * An app-wide keyboard shortcut / quick-launch code: {@code key} and/or {@code code}; it goes to
 * {@code route} or runs the app-level {@code actionId}.
 */
public record AppShortcutDto(
    String key, String label, String route, String actionId, String code) {}
